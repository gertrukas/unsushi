from flask import request, jsonify
from bson import json_util, ObjectId
from werkzeug.utils import secure_filename
import json
import os
from ..config  import mongo
from slugify import slugify
from ..models import (
    Tag,
    TagTranslation,
    Category,
    CategoryTranslation
)



def serialize_object(obj):
    """Convierte un objeto de MongoDB en un formato serializable por JSON."""
    if isinstance(obj, dict):
        return {key: serialize_object(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_object(element) for element in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

def tags_get():
    tags = []
    cursor = mongo.db.tags.find({"is_delete": False})
    count = mongo.db.tags.count_documents({"is_delete": False})
    tags_list = list(cursor)

    for tag in tags_list:
        categories_db = []
        categories = tag.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = mongo.db.categories.find_one({"_id": ObjectId(category)})
            categories_db.append(category_db)

        tag['categories'] = categories_db

        tags.append(tag)

    tags_list = serialize_object(tags)

    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": tags_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response


def tags_data_table_get():
    # Obtener parámetros de paginación
    start = int(request.args.get('start', 0))  # Indice de inicio para la paginación
    length = int(request.args.get('length', 10))  # Número de registros por página
    search_value = request.args.get('search[value]', '')  # Valor de búsqueda (opcional)

    # Lógica para contar total de registros
    total_records = get_total_records(search_value)  # Cuenta total de registros considerando búsqueda

    # Lógica para obtener los registros de la página actual
    tags_list = get_tags_page(start, length, search_value)  # Obtén registros con paginación

    result = {
        "draw": request.args.get('draw', type=int),
        "recordsTotal": total_records,
        "recordsFiltered": total_records,  # Ajusta si hay filtrado
        "data": tags_list  # Los datos de la página actual
    }

    response = jsonify(result)
    response.status_code = 200
    return response

def get_total_records(search_value):
    query = {'is_delete': False}
    
    # Si se proporciona un valor de búsqueda, modifica la consulta
    if search_value:
        # Suponiendo que buscas en un campo específico, por ejemplo 'description'
        query = {
            'is_delete': False,
            '$or': [
                {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
                {'name': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
            ]
        }

    # Cuenta los documentos que coinciden con la consulta
    total_count = mongo.db.tags.count_documents(query)
    return serialize_object(total_count)

def get_tags_page(start, length, search_value):
    query = {'is_delete': False}
    
    # Si se proporciona un valor de búsqueda, modifica la consulta
    if search_value:
        query = {
            'is_delete': False,
            '$or': [
                {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
                {'name': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
            ]
        }

    # Obtiene los registros con paginación
    _tags_list = list(mongo.db.tags.find(query)
                           .skip(start)
                           .limit(length))
    
    translations = []
    # Obtener traducciones de la categoría
    for tag in _tags_list:
        translations_by_tag = list(TagTranslation.get_tags_translation_by_tag_id(tag['_id']))
        translations.append(translations_by_tag)
    
    tags_list = []

    for tag in _tags_list:
        categories_db = []
        categories = tag.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = Category.get_category_by_id(category)
            translations_by_category = list(CategoryTranslation.get_categories_translation_by_category_id(category))
            category_db['translations'] = translations_by_category
            categories_db.append(category_db)
            
        tag['categories'] = categories_db
        tags_list.append(tag)

    # Combinar resultados
    combined_result = {
        "tags": tags_list,
        "translations": translations
    }    
    
    return serialize_object(combined_result)


def tag_get(id):
    _tag = Tag.get_tag_by_id(id)
    _tag['translations'] = list(TagTranslation.get_tags_translation_by_tag_id(id))

    if _tag:
        categories_db = []
        categories = _tag.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = Category.get_category_by_id(category)
            category_db['translations'] = list(CategoryTranslation.get_categories_translation_by_category_id(category))
            categories_db.append(category_db)

        _tag['categories'] = categories_db

        tag = serialize_object(_tag)

        response = jsonify(tag)
        response.status_code = 200
    else:
        response = jsonify({"message": "Etiqueta no encontrado"}), 404

    return response

def tag_active():
    params = request.get_json()
    id = params.get('id')
    _tag = Tag.get_tag_by_id(id)
    if _tag.get('is_active'):
        option = False
    else:
        option = True
    Tag.active_tag(id, option)
    _tag = Tag.get_tag_by_id(id)

    tag = serialize_object(_tag)
    response = jsonify(tag)
    response.status_code = 200
    return response

def allowed_file(filename):
    # Verificar si la extensión del archivo es válida
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif', 'web'}


def tag_post():
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    # Obtener la lista de IDs de categorias
    category_ids = params.getlist('categories[]')  # Usa 'categories[]' para recibir el arreglo

    # Convertir los IDs a ObjectId
    categories = [ObjectId(category_id) for category_id in category_ids] if category_ids else []

    parent = params.get('parent')

    tag = Tag(parent, categories)
    tag_id = tag.save()

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'tags/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Tag.update_tag(tag_id, {"image": f'/uploads/tags/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'tags/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/tags/images/gallery/{filename}')

        mongo.db.tags.update_one(
            {"_id": ObjectId(tag_id)},
            {"$addToSet": {"images": {"$each": image_names}}}  # Agregar las imágenes al arreglo
        )        

    for translation in translations:
        language = translation['language']
        name = translation['name']
        description = translation['description']
        intro = translation['intro']
        slug = slugify(name)
        tag_translation = TagTranslation(ObjectId(tag_id), language, name, slug, intro, description)
        tag_translation_id = tag_translation.save()

    # Obtener la categoría
    tag = Tag.get_tag_by_id(tag_id)


    # Obtener traducciones de la categoría
    translations = list(TagTranslation.get_tags_translation_by_tag_id(tag_translation_id))

    # Combinar resultados
    combined_result = {
        "tag": tag,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response



def tag_put(id):
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    # Obtener la lista de IDs de categorias
    category_ids = params.getlist('categories[]')  # Usa 'categories[]' para recibir el arreglo

    # Convertir los IDs a ObjectId
    categories = [ObjectId(category_id) for category_id in category_ids] if category_ids else []

    parent = params.get('parent')

    data = {
        "parent": parent,
        "categories": categories
    }

    tag = Tag.update_tag(id, data)

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'tags/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Tag.update_tag(id, {"image": f'/uploads/tags/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'tags/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/tags/images/gallery/{filename}')

        mongo.db.tags.update_one(
            {"_id": ObjectId(id)},
            {"$addToSet": {"images": {"$each": image_names}}}  # Agregar las imágenes al arreglo
        )        

    for translation in translations:
        if '_id' in translation:
            id_translation = translation['_id']
        language = translation['language']
        name = translation['name']
        description = translation['description']
        intro = translation['intro']
        slug = slugify(name)
        if id_translation:
            data = {
                "category": ObjectId(id), 
                "language": language, 
                "name": name, 
                "slug": slug, 
                "intro": intro, 
                "description": description
            }
            TagTranslation.update_tag_translation(id_translation, data)
        else:
            tag_translation = TagTranslation(ObjectId(id), language, name, slug, intro, description)
            tag_translation.save()
        id_translation = None     

    # Obtener la categoría
    tag = Tag.get_tag_by_id(id)


    # Obtener traducciones de la categoría
    translations = list(TagTranslation.get_tags_translation_by_tag_id(id))

    # Combinar resultados
    combined_result = {
        "tag": tag,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response
    


def tag_delete(id):
    Tag.delete_tag(id)
    _tag = Tag.get_tag_by_id(id)
    tag = serialize_object(_tag)
    message = 'El etiqueta se eliminó correctamente'
    response = jsonify({"message": message, "tag": tag})
    response.status_code = 200
    return response

def image_gallery_tag_delete(id, img):
    path_image = os.path.join('uploads/tags/images/gallery', img)

    try:
        # Supongamos que tienes una función para eliminar la imagen
        if not id:
            return jsonify({"error": "ID de imagen no proporcionado"}), 400
        
        # Verificar si el archivo existe
        if os.path.exists(path_image):
            os.remove(path_image)
            path = os.path.join('/uploads/tags/images/gallery', img)
            mongo.db.tags.update_one(
                    {'_id': ObjectId(id)},
                    {'$pull': {'images': path}}  # Suponiendo que image_filename es la referencia en el arreglo
                )

            return jsonify({"message": "Imagen eliminada con éxito", "id": id}), 200
        else:
            return jsonify({"error": "No se encontro la imagen"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        