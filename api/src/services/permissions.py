from flask import request
from bson import  ObjectId
from ..config  import mongo
from flask import jsonify
from datetime import datetime

def convert_objectid_to_str(data):
    if isinstance(data, list):
        return [{**item, '_id': str(item['_id'])} if '_id' in item else item for item in data]
    elif isinstance(data, dict) and '_id' in data:
        data['_id'] = str(data['_id'])
    return data

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
    
def permissions_get():
    # Realizar la consulta a MongoDB
    cursor = mongo.db.permissions.find({"delete": False})
    count = mongo.db.permissions.count_documents({"delete": False})
    permissions_list = list(cursor)  # Convertir el cursor a una lista


    # Convertir ObjectId a string (si es necesario)
    permissions = serialize_object(permissions_list)

    # Estructurar el JSON con la clave "data"
    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": permissions
    }
    response = jsonify(result)
    response.status_code = 200
    return response    

def permissions_data_table_get():
    # Obtener parámetros de paginación
    start = int(request.args.get('start', 0))  # Indice de inicio para la paginación
    length = int(request.args.get('length', 10))  # Número de registros por página
    search_value = request.args.get('search[value]', '')  # Valor de búsqueda (opcional)

    # Lógica para contar total de registros
    total_records = get_total_records(search_value)  # Cuenta total de registros considerando búsqueda

    # Lógica para obtener los registros de la página actual
    permissions_list = get_permissions_page(start, length, search_value)  # Obtén registros con paginación

    result = {
        "draw": request.args.get('draw', type=int),
        "recordsTotal": total_records,
        "recordsFiltered": total_records,  # Ajusta si hay filtrado
        "data": permissions_list  # Los datos de la página actual
    }

    response = jsonify(result)
    response.status_code = 200
    return response

def get_total_records(search_value):
    query = {}
    
    # Si se proporciona un valor de búsqueda, modifica la consulta
    if search_value:
        # Suponiendo que buscas en un campo específico, por ejemplo 'description'
        query = {
            'delete': False,
            '$or': [
                {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
                {'name': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
            ]
        }

    # Cuenta los documentos que coinciden con la consulta
    total_count = mongo.db.permissions.count_documents(query)
    return serialize_object(total_count)

def get_permissions_page(start, length, search_value):
    query = {}
    
    # Si se proporciona un valor de búsqueda, modifica la consulta
    if search_value:
        query = {
            'delete': False,
            '$or': [
                {'description': {'$regex': search_value, '$options': 'i'}},  # Búsqueda insensible a mayúsculas
                {'name': {'$regex': search_value, '$options': 'i'}}  # Otros campos donde se puede buscar
            ]
        }

    # Obtiene los registros con paginación
    permissions_list = list(mongo.db.permissions.find(query)
                           .skip(start)
                           .limit(length))
    
    return serialize_object(permissions_list)

def permission_get(id):
    _permission = mongo.db.permissions.find_one({ "_id": ObjectId(id)})
    permission = serialize_object(_permission)
    response = jsonify(permission)
    response.status_code = 200
    return response

def permission_active():
    params = request.get_json()
    id = params.get('id')
    __permission = mongo.db.permissions.find_one({"_id": ObjectId(id)})
    if __permission.get('active'):
        option = False
    else:
        option = True
    mongo.db.permissions.update_one({ "_id": ObjectId(id)}, {"$set": {"active": option}})
    _permission = mongo.db.permissions.find_one({"_id": ObjectId(id)})
    permission = serialize_object(_permission)
    response = jsonify(permission)
    response.status_code = 200
    return response

def permission_post():
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    params = request.get_json()
    mongo.db.permissions.insert_one({
        'name': params.get('name'),
        'code': params.get('code'),
        "created_at": formatted_date,
        "updated_at": None,
        'active': True,
        'delete': False,
    })

    _permission = mongo.db.permissions.find_one({ "name": params.get('name')})


    permission = serialize_object(_permission)
    result = {
        "success": permission
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def permission_put(id):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    params = request.get_json()
    if '_id' in params:
        del params['_id']

    mongo.db.permissions.update_one({"_id": ObjectId(id)}, {"$set": params})

    mongo.db.permissions.update_one({"_id": ObjectId(id)}, {"$set": {"updated_at": formatted_date}})
    _permission = mongo.db.permissions.find_one({ "_id": ObjectId(id)})

    permission = serialize_object(_permission)
    response = jsonify(permission)
    response.status_code = 200
    return response

def permission_delete(id):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    mongo.db.permissions.update_one({ "_id": ObjectId(id)}, {"$set": {"delete": True, "updated_at": formatted_date }})
    _permission = mongo.db.permissions.find_one({ "_id": ObjectId(id)})
    permission = serialize_object(_permission)
    message = 'El usuario se elimino correctamente'
    response = jsonify({"message": message, "permission": permission})
    response.status_code = 200
    return response
