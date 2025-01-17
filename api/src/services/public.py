from flask import request, jsonify
from bson import ObjectId
from ..config  import mongo
from ..models import (
    Blog,
    BlogTranslation,
    Product,
    ProductTranslation,
    Category,
    CategoryTranslation,
    Tag,
    TagTranslation
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
    

def search_get_all():
    params = request.get_json()
    # Obtener parámetros de paginación
    start = int(params.get('start', 0))  # Indice de inicio para la paginación
    length = int(params.get('length', 3))  # Número de registros por página
    search_value = params.get('item', '')  # Valor de búsqueda (opcional)
    language = params.get('language', '')

    # Lógica para obtener los registros de la página actual
    data = get_search_page_all(start, length, search_value, language)  # Obtén registros con paginación

    result = {
        "data": data  # Los datos de la página actual
    }

    response = jsonify(result)
    response.status_code = 200
    return response

def get_search_page_all(start, length, search_value, language):
    query = {
        "language": language,
        '$or': [
            {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
            {'name': {'$regex': search_value, '$options': 'i'}},  # Otros campos donde se puede buscar
            {'intro': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
        ]
    }

    blogs_list = []
    products_list = []
    categories_list = []
    tags_list = []

    # Obtiene los registros con paginación
    translations_blogs = list(mongo.db.blog_translations.find(query)
                            .skip(start)
                            .limit(length))
    translations_products = ProductTranslation.get_pagination_products_translation(query, start, length)
    translations_categories = list(mongo.db.category_translations.find(query)
                            .skip(start)
                            .limit(length))
    translations_tags = list(mongo.db.tag_translations.find(query)
                            .skip(start)
                            .limit(length))

    for blog_translations in translations_blogs:
        blog = Blog.get_blog_by_id(blog_translations['blog'])
        blog['translations'] = list(BlogTranslation.get_blogs_translation_by_blog_id(blog_translations['blog']))
        blogs_list.append(blog)

    for category_translations in translations_categories:
        category = Category.get_category_by_id(category_translations['category'])
        category['translations'] = list(CategoryTranslation.get_categories_translation_by_category_id(category_translations['category']))
        categories_list.append(category)

    for product_translations in translations_products:
        product = Product.get_product_by_id(product_translations['product'])
        product['translations'] = list(ProductTranslation.get_products_translation_by_product_id(product_translations['product']))
        products_list.append(product)

    for tag_translations in translations_tags:
        tag = Tag.get_tag_by_id(tag_translations['tag'])
        tag['translations'] = list(TagTranslation.get_tags_translation_by_tag_id(tag_translations['tag']))
        tags_list.append(tag)            


    # _tags_list = list(mongo.db.tags.find(query)
    #                        .skip(start)
    #                        .limit(length)) 

    # Combinar resultados
    combined_result = {
        "blogs": blogs_list,
        "products": products_list,
        "categories": categories_list,
        "tags": tags_list
    }    
    
    return serialize_object(combined_result) 

def products_public_get():
    params = request.get_json()
    # Obtener parámetros de paginación
    start = int(params.get('start', 0))  # Indice de inicio para la paginación
    if start > 1:
        start = (start - 1) * length
    else:
        start = 0
    length = int(params.get('length', 8))  # Número de registros por página
    search_value = params.get('search_value', '')  # Valor de búsqueda (opcional)
    language = params.get('language', '')

    # Lógica para obtener los registros de la página actual
    data = get_products_all(start, length, search_value, language)  # Obtén registros con paginación

    result = {
        "data": data  # Los datos de la página actual
    }

    response = jsonify(result)
    response.status_code = 200
    return response

def get_products_all(start, length, search_value=None, language='es'):
    query = {
        "is_active": True,
        "is_delete": False
    }
    products_list = []
    if search_value:
        query = {
            "language":  language,
            '$or': [
                {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
                {'name': {'$regex': search_value, '$options': 'i'}},  # Otros campos donde se puede buscar
                {'intro': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
            ]
        }
        translations_products = ProductTranslation.get_pagination_products_translation(query, start, length)
        
        for product_translations in translations_products:
            product = Product.get_product_by_id(product_translations['product'])
            product['translations'] = list(ProductTranslation.get_products_translation_by_product_id(product_translations['product']))
            products_list.append(product)
    else:
        _products = Product.get_pagination_products(query, start, length)
        for product in _products:
            product['translations'] = list(ProductTranslation.get_products_translation_by_product_id(product['_id']))
            products_list.append(product)

    return serialize_object(products_list)