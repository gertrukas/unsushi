from flask import request
from bson import ObjectId
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

def roles_get():
    roles = []
    cursor = mongo.db.roles.find({"delete": False})
    count = mongo.db.roles.count_documents({"delete": False})
    roles_list = list(cursor)  # Convertir el cursor a una lista

    for role in roles_list:
        permission_ids = role.get('permissions', [])
        permissions = list(mongo.db.permissions.find({"_id": {"$in": [ObjectId(permission_id) for permission_id in permission_ids]}}))
        role['permissions'] = permissions
        roles.append(role)

    # Convertir ObjectId a string (si es necesario)
    roles_list = serialize_object(roles)

    # Estructurar el JSON con la clave "data"
    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": roles_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def role_get(id):
    _role = mongo.db.roles.find_one({ "_id": ObjectId(id)})
    permission_ids = _role.get('permissions', [])
    permissions = list(mongo.db.permissions.find({"_id": {"$in": [ObjectId(permission_id) for permission_id in permission_ids]}}))
    _role['permissions'] = permissions
    role = serialize_object(_role)
    response = jsonify(role)
    response.status_code = 200
    return response

def role_active():
    params = request.get_json()
    id = params.get('id')
    __role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    if __role.get('active'):
        option = False
    else:
        option = True
    mongo.db.roles.update_one({ "_id": ObjectId(id)}, {"$set": {"active": option}})
    _role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    role = convert_objectid_to_str(_role)
    response = jsonify(role)
    response.status_code = 200
    return response

def role_post():
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    params = request.get_json()
    permissions = params.get('permissions')
    mongo.db.roles.insert_one({
        'name': params.get('name'),
        'created_at': formatted_date,
        'updated_at': formatted_date,
        'permissions': [],
        'users': [],
        'active': True,
        'delete': False,
    })
    _role = mongo.db.roles.find_one({"name": params.get('name')})

    if permissions:
        _permissions = []
        for permission in permissions:
            _permissions.append(ObjectId(permission['_id']))
        mongo.db.roles.update_one({"_id": ObjectId(_role['_id'])}, {"$addToSet": {"permissions": {"$each": _permissions}}})

    role = serialize_object(_role)
    result = {
        "success": role
        # "success": "success"
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def role_users_post():
    params = request.get_json()
    id = params.get('id')
    _role = mongo.db.roles.find_one({"_id": ObjectId(id)})
    count = len(_role['users'])
    users = []

    user_ids = _role.get('users', [])
    # Consultar los detalles de los roles usando los ObjectIds
    users_list = list(mongo.db.users.find({"_id": {"$in": [ObjectId(user_id) for user_id in user_ids]}}))
    # Asignar los detalles de roles al usuario

    for user in users_list:
        # Obtener los ObjectIds de roles que el usuario tiene
        role_ids = user.get('roles', [])

        # Consultar los detalles de los roles usando los ObjectIds
        roles = list(mongo.db.roles.find({"_id": {"$in": [ObjectId(role_id) for role_id in role_ids]}}))

        # Asignar los detalles de roles al usuario
        user['roles'] = roles

        # Agregar el usuario con roles poblados a la lista
        users.append(user)



    # Convertir ObjectId a string (si es necesario)
    roles_list = serialize_object(users)

    # Estructurar el JSON con la clave "data"
    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": roles_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def role_put(id):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    params = request.get_json()
    permissions = params.get('permissions')
    name = params.get('name')

    print(f"estos son los permisos {permissions}")

    mongo.db.roles.update_one({ "_id": ObjectId(id)}, {"$set": {"name": name, "updated_at": formatted_date}})
    _role = mongo.db.roles.find_one({ "_id": ObjectId(id)})

    if permissions:
        _permissions = []
        for permission in permissions:
            _permissions.append(ObjectId(permission['_id']))
        mongo.db.roles.update_one({"_id": ObjectId(id)}, {"$addToSet": {"permissions": {"$each": _permissions}}})

    role = serialize_object(_role)
    response = jsonify(role)
    response.status_code = 200
    return response

def role_delete(id):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    mongo.db.roles.update_one({ "_id": ObjectId(id)}, {"$set": {"delete": True, "updated_at": formatted_date}})
    _role = mongo.db.roles.find_one({ "_id": ObjectId(id)})
    role = serialize_object(_role)
    response = jsonify(role)
    response.status_code = 200
    return response
