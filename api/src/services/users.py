from flask import request
from bson import ObjectId
from flask_bcrypt import generate_password_hash
from ..config  import mongo
from flask import jsonify
from datetime import datetime, timedelta
from ..models import User

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

def users_get():
    users = []
    # Realizar la consulta a MongoDB
    cursor = mongo.db.users.find({"is_delete": False})
    count = mongo.db.users.count_documents({"is_delete": False})
    users_list = list(cursor)  # Convertir el cursor a una lista

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
    users_list = serialize_object(users)

    # Estructurar el JSON con la clave "data"
    result = {
        "draw": 1,
        "recordsTotal": count,
        "recordsFiltered": count,
        "data": users_list
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def user_get(id):
    user = User.get_user_by_id(id)
    response = jsonify(serialize_object(user))
    response.status_code = 200
    return response

def user_active():
    params = request.get_json()
    id = params.get('id')
    _user = User.get_user_by_id(id)
    if _user.get('active'):
        option = False
    else:
        option = True
    User.active_user(id, option)
    user = User.get_user_by_id(id)
    response = jsonify(serialize_object(user))
    response.status_code = 200
    return response

def user_post():
    params = request.get_json()
    name = params.get('name')
    email = params.get('email')
    password = generate_password_hash(params.get('password')).decode('utf-8')
    role = params.get('role')
    _user = User(name, email, password)
    user_id = _user.save()
    if isinstance(user_id, dict) and 'error' in user_id:
        response = jsonify({"message": user_id.get('error')})
        response.status_code = 409
        return response

    user = User.get_user_by_id(user_id)
    if role:
        _role = mongo.db.roles.find_one({"name": role})
        roles = []
        roles.append(_role.get('_id'))
        User.update_roles_and_user(user_id, roles)

    result = {
        "success": serialize_object(user)
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def user_put(id):
    params = request.get_json()
    if '_id' in params:
        del params['_id']

    __role = params.get('role')
    if __role:
        _role = mongo.db.roles.find_one({"name": __role})
        User.update_user(id, { "role": _role.get('_id')})

    User.update_user(id, params)

    user = User.get_user_by_id(id)
    response = jsonify(serialize_object(user))
    response.status_code = 200
    return response

def user_delete(id):
    User.delete_user(id)
    user = User.get_user_by_id(id)
    response = jsonify({"message": 'El usuario se elimino correctamente', "user": serialize_object(user)})
    response.status_code = 200
    return response

def get_online_users():
    one_hour_ago = datetime.now() - timedelta(minutes=10)
    one_hour_ago_str = one_hour_ago.strftime("%Y-%m-%d %H:%M:%S")

    active_users = mongo.db.users.find({
        'last_login_at': {'$gte': one_hour_ago_str}
    })
    count = mongo.db.users.count_documents({
        'last_login_at': {'$gte': one_hour_ago_str}
    })
    _users = list(active_users)
    users = serialize_object(_users)
    result = {
        "count": count,
        "users": users
    }
    response = jsonify(result)
    response.status_code = 200
    return response


# 5519515235
# Jaciel Gonzales 5580296132
# Berenice Espinoza 5579618425