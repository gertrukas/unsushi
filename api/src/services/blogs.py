from flask import request, jsonify
from bson import json_util, ObjectId
from werkzeug.utils import secure_filename
import json
import os
from ..config  import mongo
from slugify import slugify
from ..models import (
    Blog,
    BlogTranslation
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

def blogs_get():
    blogs = []
    cursor = mongo.db.blogs.find({"is_delete": False})
    count = mongo.db.blogs.count_documents({"is_delete": False})
    blogs_list = list(cursor)

    blogs_list = serialize_object(blogs)

    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": blogs_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response


def blogs_data_table_get():
    # Obtener parámetros de paginación
    start = int(request.args.get('start', 0))  # Indice de inicio para la paginación
    length = int(request.args.get('length', 10))  # Número de registros por página
    search_value = request.args.get('search[value]', '')  # Valor de búsqueda (opcional)

    # Lógica para contar total de registros
    total_records = get_total_records(search_value)  # Cuenta total de registros considerando búsqueda

    # Lógica para obtener los registros de la página actual
    blogs_list = get_blogs_page(start, length, search_value)  # Obtén registros con paginación

    result = {
        "draw": request.args.get('draw', type=int),
        "recordsTotal": total_records,
        "recordsFiltered": total_records,  # Ajusta si hay filtrado
        "data": blogs_list  # Los datos de la página actual
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
    total_count = mongo.db.blogs.count_documents(query)
    return serialize_object(total_count)

def get_blogs_page(start, length, search_value):
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
    _blogs_list = list(mongo.db.blogs.find(query)
                           .skip(start)
                           .limit(length))
    
    translations = []
    # Obtener traducciones de la categoría
    for blog in _blogs_list:
        translations_by_blog = list(BlogTranslation.get_blogs_translation_by_blog_id(blog['_id']))
        translations.append(translations_by_blog)


    # Combinar resultados
    combined_result = {
        "blogs": _blogs_list,
        "translations": translations
    }    
    
    return serialize_object(combined_result)


def blog_get(id):
    _blog = Blog.get_blog_by_id(id)
    _blog['translations'] = list(BlogTranslation.get_blogs_translation_by_blog_id(id))

    if _blog:
        blog = serialize_object(_blog)

        response = jsonify(blog)
        response.status_code = 200
    else:
        response = jsonify({"message": "blog no encontrado"}), 404

    return response

def blog_active():
    params = request.get_json()
    id = params.get('id')
    _blog = Blog.get_blog_by_id(id)
    if _blog.get('is_active'):
        option = False
    else:
        option = True
    Blog.active_blog(id, option)
    _blog = Blog.get_blog_by_id(id)

    blog = serialize_object(_blog)
    response = jsonify(blog)
    response.status_code = 200
    return response

def allowed_file(filename):
    # Verificar si la extensión del archivo es válida
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif', 'web'}


def blog_post():
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    is_new = True if params.get('is_new') == 'true' or params.get('is_new') == True else False

    blog = Blog(is_new)
    blog_id = blog.save()

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'blogs/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Blog.update_blog(blog_id, {"image": f'/uploads/blogs/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'blogs/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/blogs/images/gallery/{filename}')

        mongo.db.blogs.update_one(
            {"_id": ObjectId(blog_id)},
            {"$addToSet": {"images": {"$each": image_names}}}  # Agregar las imágenes al arreglo
        )        

    for translation in translations:
        language = translation['language']
        name = translation['name']
        description = translation['description']
        intro = translation['intro']
        slug = slugify(name)
        blog_translation = BlogTranslation(ObjectId(blog_id), language, name, slug, intro, description)
        blog_translation_id = blog_translation.save()

    # Obtener la categoría
    blog = Blog.get_blog_by_id(blog_id)


    # Obtener traducciones de la categoría
    translations = list(BlogTranslation.get_blogs_translation_by_blog_id(blog_translation_id))

    # Combinar resultados
    combined_result = {
        "blog": blog,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response



def blog_put(id):
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'blogs/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Blog.update_blog(id, {"image": f'/uploads/blogs/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'blogs/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/blogs/images/gallery/{filename}')

        mongo.db.blogs.update_one(
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
            BlogTranslation.update_blog_translation(id_translation, data)
        else:
            blog_translation = BlogTranslation(ObjectId(id), language, name, slug, intro, description)
            blog_translation.save()
        id_translation = None     

    # Obtener la categoría
    blog = Blog.get_blog_by_id(id)


    # Obtener traducciones de la categoría
    translations = list(BlogTranslation.get_blogs_translation_by_blog_id(id))

    # Combinar resultados
    combined_result = {
        "blog": blog,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response
    


def blog_delete(id):
    Blog.delete_blog(id)
    _blog = Blog.get_blog_by_id(id)
    blog = serialize_object(_blog)
    message = 'El blog se eliminó correctamente'
    response = jsonify({"message": message, "blog": blog})
    response.status_code = 200
    return response

def image_gallery_blog_delete(id, img):
    path_image = os.path.join('uploads/blogs/images/gallery', img)
    print(path_image)

    try:
        # Supongamos que tienes una función para eliminar la imagen
        if not id:
            return jsonify({"error": "ID de imagen no proporcionado"}), 400
        
        # Verificar si el archivo existe
        if os.path.exists(path_image):
            os.remove(path_image)
            path = os.path.join('/uploads/blogs/images/gallery', img)
            mongo.db.blogs.update_one(
                    {'_id': ObjectId(id)},
                    {'$pull': {'images': path}}  # Suponiendo que image_filename es la referencia en el arreglo
                )

            return jsonify({"message": "Imagen eliminada con éxito", "id": id}), 200
        else:
            return jsonify({"error": "No se encontro la imagen"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        