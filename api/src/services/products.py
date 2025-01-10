from flask import request, jsonify
from bson import json_util, ObjectId
from werkzeug.utils import secure_filename
import json
import os
from ..config  import mongo
from slugify import slugify
from ..models import (
    Product,
    ProductTranslation,
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

def products_get():
    products = []
    cursor = mongo.db.products.find({"is_delete": False})
    count = mongo.db.products.count_documents({"is_delete": False})
    products_list = list(cursor)

    for product in products_list:
        categories_db = []
        categories = product.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = mongo.db.categories.find_one({"_id": ObjectId(category)})
            categories_db.append(category_db)

        product['categories'] = categories_db

        products.append(product)

    products_list = serialize_object(products)

    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": products_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response


def products_data_table_get():
    # Obtener parámetros de paginación
    start = int(request.args.get('start', 0))  # Indice de inicio para la paginación
    length = int(request.args.get('length', 10))  # Número de registros por página
    search_value = request.args.get('search[value]', '')  # Valor de búsqueda (opcional)

    # Lógica para contar total de registros
    total_records = get_total_records(search_value)  # Cuenta total de registros considerando búsqueda

    # Lógica para obtener los registros de la página actual
    products_list = get_products_page(start, length, search_value)  # Obtén registros con paginación

    result = {
        "draw": request.args.get('draw', type=int),
        "recordsTotal": total_records,
        "recordsFiltered": total_records,  # Ajusta si hay filtrado
        "data": products_list  # Los datos de la página actual
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
    total_count = mongo.db.products.count_documents(query)
    return serialize_object(total_count)

def get_products_page(start, length, search_value):
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
    _products_list = list(mongo.db.products.find(query)
                           .skip(start)
                           .limit(length))
    
    translations = []
    # Obtener traducciones de la categoría
    for product in _products_list:
        translations_by_product = list(ProductTranslation.get_products_translation_by_product_id(product['_id']))
        translations.append(translations_by_product)
    
    products_list = []

    for product in _products_list:
        categories_db = []
        categories = product.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = Category.get_category_by_id(category)
            translations_by_category = list(CategoryTranslation.get_categories_translation_by_category_id(category))
            category_db['translations'] = translations_by_category
            categories_db.append(category_db)
            
        product['categories'] = categories_db
        products_list.append(product)

    # Combinar resultados
    combined_result = {
        "products": products_list,
        "translations": translations
    }    
    
    return serialize_object(combined_result)


def product_get(id):
    _product = Product.get_product_by_id(id)
    _product['translations'] = list(ProductTranslation.get_products_translation_by_product_id(id))

    if _product:
        categories_db = []
        categories = _product.get('categories')
        for category in categories:
            # Obtener categoría
            category_db = Category.get_category_by_id(category)
            category_db['translations'] = list(CategoryTranslation.get_categories_translation_by_category_id(category))
            categories_db.append(category_db)

        _product['categories'] = categories_db

        product = serialize_object(_product)

        response = jsonify(product)
        response.status_code = 200
    else:
        response = jsonify({"message": "Producto no encontrado"}), 404

    return response

def product_active():
    params = request.get_json()
    id = params.get('id')
    _product = Product.get_product_by_id(id)
    if _product.get('is_active'):
        option = False
    else:
        option = True
    Product.active_product(id, option)
    _product = Product.get_product_by_id(id)

    product = serialize_object(_product)
    response = jsonify(product)
    response.status_code = 200
    return response

def allowed_file(filename):
    # Verificar si la extensión del archivo es válida
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif', 'web'}


def product_post():
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    is_new = True if params.get('is_new') == 'true' or params.get('is_new') == True else False
    model = params.get('model')
    key = params.get('key')
    # Obtener la lista de IDs de categorias
    category_ids = params.getlist('categories[]')  # Usa 'categories[]' para recibir el arreglo

    # Convertir los IDs a ObjectId
    categories = [ObjectId(category_id) for category_id in category_ids] if category_ids else []

    dimensions = params.get('dimensions')

    product = Product(model, key, dimensions, is_new, categories)
    product_id = product.save()

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'products/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Product.update_product(product_id, {"image": f'/uploads/products/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'products/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/products/images/gallery/{filename}')

        mongo.db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$addToSet": {"images": {"$each": image_names}}}  # Agregar las imágenes al arreglo
        )        

    for translation in translations:
        language = translation['language']
        name = translation['name']
        description = translation['description']
        intro = translation['intro']
        slug = slugify(name)
        product_translation = ProductTranslation(ObjectId(product_id), language, name, slug, intro, description)
        product_translation_id = product_translation.save()

    # Obtener la categoría
    product = Product.get_product_by_id(product_id)


    # Obtener traducciones de la categoría
    translations = list(ProductTranslation.get_products_translation_by_product_id(product_translation_id))

    # Combinar resultados
    combined_result = {
        "product": product,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response



def product_put(id):
    params = request.form
    file = request.files.get('file')
    files = request.files.getlist('images')
    image_names = []
    # Datos de la categoria
    translations = json.loads(params.get('translations', []))
    is_new = True if params.get('is_new') == 'true' or params.get('is_new') == True else False
    model = params.get('model')
    key = params.get('key')
    # Obtener la lista de IDs de categorias
    category_ids = params.getlist('categories[]')  # Usa 'categories[]' para recibir el arreglo

    # Convertir los IDs a ObjectId
    categories = [ObjectId(category_id) for category_id in category_ids] if category_ids else []

    dimensions = params.get('dimensions')

    data = {
        "is_new": is_new,
        "model": model,
        "key": key,
        "dimensions": dimensions,
        "categories": categories
    }

    product = Product.update_product(id, data)

    upload_folder = os.path.join(os.getcwd(), 'uploads')

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, 'products/images', filename)
        if not os.path.exists(os.path.dirname(file_path)):
            os.makedirs(os.path.dirname(file_path))
        file.save(file_path)
        Product.update_product(id, {"image": f'/uploads/products/images/{filename}'})

    if files:
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(upload_folder, 'products/images/gallery', filename)
                if not os.path.exists(os.path.dirname(file_path)):
                    os.makedirs(os.path.dirname(file_path))
                file.save(file_path)
                image_names.append(f'/uploads/products/images/gallery/{filename}')

        mongo.db.products.update_one(
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
            ProductTranslation.update_product_translation(id_translation, data)
        else:
            product_translation = ProductTranslation(ObjectId(id), language, name, slug, intro, description)
            product_translation.save()
        id_translation = None     

    # Obtener la categoría
    product = Product.get_product_by_id(id)


    # Obtener traducciones de la categoría
    translations = list(ProductTranslation.get_products_translation_by_product_id(id))

    # Combinar resultados
    combined_result = {
        "product": product,
        "translations": translations
    }

    response = jsonify(serialize_object(combined_result))
    response.status_code = 200
    return response
    


def product_delete(id):
    Product.delete_product(id)
    _product = Product.get_product_by_id(id)
    product = serialize_object(_product)
    message = 'El producto se eliminó correctamente'
    response = jsonify({"message": message, "product": product})
    response.status_code = 200
    return response

def image_gallery_product_delete(id, img):
    path_image = os.path.join('uploads/products/images/gallery', img)
    print(path_image)

    try:
        # Supongamos que tienes una función para eliminar la imagen
        if not id:
            return jsonify({"error": "ID de imagen no proporcionado"}), 400
        
        # Verificar si el archivo existe
        if os.path.exists(path_image):
            os.remove(path_image)
            path = os.path.join('/uploads/products/images/gallery', img)
            mongo.db.products.update_one(
                    {'_id': ObjectId(id)},
                    {'$pull': {'images': path}}  # Suponiendo que image_filename es la referencia en el arreglo
                )

            return jsonify({"message": "Imagen eliminada con éxito", "id": id}), 200
        else:
            return jsonify({"error": "No se encontro la imagen"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        