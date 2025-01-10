from flask import request, jsonify
from bson import json_util, ObjectId
from werkzeug.utils import secure_filename
from slugify import slugify
import json
import os
from ..config import mongo
from ..models import (
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

def categories_get():
    cursor = mongo.db.categories.find({"is_delete": False})
    count = mongo.db.categories.count_documents({"is_delete": False})
    _categories_list = list(cursor)

    # Obtener traducciones de la categoría
    for category in _categories_list:
        translations_by_category = list(CategoryTranslation.get_categories_translation_by_category_id(category['_id']))
        category['translations'] = translations_by_category


    categories_list = serialize_object(_categories_list)

    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": categories_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response


def categories_data_table_get():
    # Obtener parámetros de paginación
    start = int(request.args.get('start', 0))  # Indice de inicio para la paginación
    length = int(request.args.get('length', 10))  # Número de registros por página
    search_value = request.args.get('search[value]', '')  # Valor de búsqueda (opcional)

    # Lógica para contar total de registros
    total_records = get_total_records(search_value)  # Cuenta total de registros considerando búsqueda

    # Lógica para obtener los registros de la página actual
    categories_list = get_categories_page(start, length, search_value)  # Obtén registros con paginación

    result = {
        "draw": request.args.get('draw', type=int),
        "recordsTotal": total_records,
        "recordsFiltered": total_records,  # Ajusta si hay filtrado
        "data": categories_list  # Los datos de la página actual
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
    total_count = mongo.db.categories.count_documents(query)
    return serialize_object(total_count)

def get_categories_page(start, length, search_value):
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
    categories_list = list(mongo.db.categories.find(query)
                           .skip(start)
                           .limit(length))
    translations = []
    # Obtener traducciones de la categoría
    for category in categories_list:
        translations_by_category = list(CategoryTranslation.get_categories_translation_by_category_id(category['_id']))
        translations.append(translations_by_category)

    # Combinar resultados
    combined_result = {
        "categories": categories_list,
        "translations": translations
    }


    
    return serialize_object(combined_result)


def category_get(id):
    # Obtener la categoría
    category = Category.get_category_by_id(id)
    
    # Si no se encuentra la categoría, devolver None
    if not category:
        return None

    # Obtener traducciones de la categoría
    translations = list(CategoryTranslation.get_categories_translation_by_category_id(id))

    # Combinar resultados
    combined_result = {
        "category": category,
        "translations": translations
    }

    result = serialize_object(combined_result)

    response = jsonify(result)
    response.status_code = 200

    return response

def category_active():
    params = request.get_json()
    id = params.get('id')
    _category = Category.get_category_by_id(id)
    if _category.get('is_active'):
        option = False
    else:
        option = True
    Category.active_category(id, option)

    _category = Category.get_category_by_id(id)

    category = serialize_object(_category)
    response = jsonify(category)
    response.status_code = 200
    return response



def category_post():
    params = request.form
    file = request.files.get('file')
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    is_new = True if params.get('is_new') == 'true' or params.get('is_new') == True else False

    category = Category(is_new)
    category_id = category.save()

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'categories/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Category.update_category(category_id, {"image": f'/uploads/categories/images/{filename}'})

    for translation in translations:
        language = translation['language']
        name = translation['name']
        section = translation['section']
        description = translation['description']
        intro = translation['intro']
        slug = slugify(name)
        category_translation = CategoryTranslation(ObjectId(category_id), language, name, slug, intro, description, section)
        category_translation_id = category_translation.save()

    # Obtener la categoría
    category = Category.get_category_by_id(category_id)


    # Obtener traducciones de la categoría
    translations = list(CategoryTranslation.get_categories_translation_by_category_id(category_translation_id))

    # Combinar resultados
    combined_result = {
        "category": category,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response


def category_put(id):
    params = request.form
    file = request.files.get('file')

    # Datos de la categoria
    translations = json.loads(params.get('translations', []))

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'categories/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Category.update_category(id, {"image": f'/uploads/categories/images/{filename}'})

    for translation in translations:
        if '_id' in translation:
            id_translation = translation['_id']
        language = translation['language']
        name = translation['name']
        section = translation['section']
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
                "description": description, 
                "section": section
            }
            CategoryTranslation.update_category_translation(id_translation, data)
        else:
            category_translation = CategoryTranslation(ObjectId(id), language, name, slug, intro, description, section)
            category_translation.save()
        id_translation = None    

    # Obtener la categoría
    category = Category.get_category_by_id(id)

    # Obtener traducciones de la categoría
    translations = list(CategoryTranslation.get_categories_translation_by_category_id(id))

    # Combinar resultados
    combined_result = {
        "category": category,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response


def category_delete(id):
    Category.delete_category(id)
    category = json_util.dumps(Category.get_category_by_id(id))
    message = 'El categoria se eliminó correctamente'
    response = jsonify({"message": message, "category": category})
    response.status_code = 200
    return response