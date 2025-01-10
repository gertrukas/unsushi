from flask import request, render_template
from bson import ObjectId
from werkzeug.utils import secure_filename
from ..config  import mongo
from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import decode_token, create_access_token, current_user
from flask import jsonify
from ..config import jwt
from datetime import datetime, timedelta
from ..config import mail
from flask_mail import Message
import os
import jwt as jwt_exceptions
from flask_jwt_extended import create_access_token, get_jwt

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

def register():
    data = request.get_json()
    password = generate_password_hash(data.get('password')).decode('utf-8')
    name = data.get('name'),
    email = data.get('email'),
    mongo.db.users.insert_one({
        'name': name,
        'email': email,
        'password': password,
        'active': True,
        'delete': False,
    })

    user = mongo.db.users.find_one({'email': data.get('email')})
    id = str(user.get('_id'))
    token = create_access_token(identity=id)
    response = jsonify({"message": "Usuario registrado", "authToken": token})
    response.status_code = 200
    return response

def login():
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({'email': email})
    
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404
    
    id = str(user.get('_id'))
    role = user.get('role')
    active = user.get('active')
    delete = user.get('delete')
    
    if not check_password_hash(user.get('password'), password):
        return jsonify({"message": "Contraseña equivocada"}), 403

    if delete:
        return jsonify({"message": "Usuario fue borrado"}), 404

    if not active:
        return jsonify({"message": "Usuario no está activo"}), 406

    if role in ['USER_ROLE', 'CLIENT_ROLE']:
        return jsonify({"message": "El perfil de usuario no tiene acceso"}), 402

    # Definir el tiempo de expiración del token (ejemplo: 1 hora)
    expires = timedelta(hours=1)
    
    # Generar el token de acceso con el tiempo de expiración
    token = create_access_token(identity=id, expires_delta=expires)


    # Guardar registro de inicio de sesión
    mongo.db.users.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "last_login_at": formatted_date,
            "last_login_ip": request.remote_addr
        }}
    )

    # Retornar el token de autenticación junto con el tiempo de expiración en segundos
    response = jsonify({
        "message": "Usuario logeado",
        "authToken": token,
        "expires_in": expires.total_seconds()
    })
    response.status_code = 200
    return response


def change_password(id):
    data = request.get_json()
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    user = serialize_object(mongo.db.users.find_one({'_id': ObjectId(id)}))
    if check_password_hash(user['password'], current_password):
        password = generate_password_hash(new_password).decode('utf-8')
        _user = mongo.db.users.update_one({"_id": ObjectId(id)}, {"$set": {"password": password, "updated_at": formatted_date}})
        response = jsonify({"success": { "user": user }})
        response.status_code = 200
        return response
    else:
        response = jsonify({"message": "Contraseña anterior equivocada"})
        response.status_code = 403
        return response

def change_email(id):
    data = request.get_json()
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    email = data.get('email')
    mongo.db.users.update_one({"_id": ObjectId(id)}, {"$set": {"email": email, "updated_at": formatted_date}})
    user = serialize_object(mongo.db.users.find_one({'_id': ObjectId(id)}))
    response = jsonify({"success": {"user": user}})
    response.status_code = 200
    return response

def user_update_post(id):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    file = request.files.get('file')
    params = request.form
    name = f"{params.get('first_name')} {params.get('last_name')}"
    data = {
        'name': name,
        'phone': params.get('phone'),
        "updated_at": formatted_date
    }

    if file:
        filename = secure_filename(file.filename)
        uploads_dir = os.path.join(os.getcwd(), 'uploads', 'users', 'images')
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
        file_path = os.path.join(uploads_dir, filename)
        file.save(file_path)
        data['avatar'] = f'/uploads/users/images/{filename}'

    mongo.db.users.update_one({"_id": ObjectId(id)}, {"$set": data})

    _user = mongo.db.users.find_one({"_id": ObjectId(id)})

    user = serialize_object(_user)
    result = {
        "success": user
    }
    response = jsonify(result)
    response.status_code = 200
    return response

def reset_password_post():
    data = request.get_json()
    token = data.get('token')
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    user_id = verify_reset_token(token)

    if user_id is None:
        response = jsonify({"success": False, "message": "Token invalido o expirado"})
        response.status_code = 400
        return response

    new_password = data.get('password')
    password = generate_password_hash(new_password).decode('utf-8')
    mongo.db.users.update_one({"_id": ObjectId(user_id)},{"$set": {"password": password, "updated_at": formatted_date}})

    response = jsonify({"success": True})
    response.status_code = 200
    return response

def forgot_password_post():
    data = request.get_json()
    email = data.get('email')
    urls = os.getenv('ALLOWED_ORIGINS', '').split(',')
    referer = request.headers.get('Referer')
    url = ''
    for url in urls:
        if "admin" in url and "admin" in referer:
            url = url
        else:
            url = url
    user = mongo.db.users.find_one({'email': email})
    if user is None:
        response = False
        response.status_code = 404
        return response

    id = str(user['_id'])
    token = create_access_token(identity=id, expires_delta=timedelta(hours=1))

    # Enviar el correo con el enlace de restablecimiento
    reset_link = f"{url}/auth/forgot-password?token={token}"

    msg = Message("Restablecimiento de contraseña",
                  sender="sistema@grupoindustrialcarey.com",
                  recipients=[email])
    # msg.body = "Restablecer contraseña"
    msg.html = render_template('reset_password.html', reset_link=reset_link)
    mail.send(msg)
    response = jsonify({"success": True})

    response.status_code = 200
    return response

def me():
    id = str(current_user.get('_id'))
    role_ids = current_user.get('roles', [])
    _roles = list(mongo.db.roles.find({"_id": {"$in": [ObjectId(role_id) for role_id in role_ids]}}))
    roles = serialize_object(_roles)
    current_user['roles'] = roles

    for rol in current_user['roles']:
        permission_ids = rol.get('permissions', [])
        _permissions = list(mongo.db.permissions.find({"_id": {"$in": [ObjectId(permission_id) for permission_id in permission_ids]}}))
        permissions = serialize_object(_permissions)
        rol['permissions'] = permissions


    response = jsonify({
        "_id": id,
        "name": current_user.get('name'),
        "email": current_user.get('email'),
        "phone": current_user.get('phone'),
        "role": current_user.get('role'),
        "roles": current_user.get('roles'),
        "avatar": current_user.get('avatar'),
        "active": current_user.get('active'),
        "delete": current_user.get('delete')
    })
    response.status_code = 200
    return response

def verify_reset_token(token):
    try:
        data = decode_token(token)
        return data['sub']  # Asegúrate de que 'sub' sea el campo que contiene el ID del usuario
    except jwt_exceptions.ExpiredSignatureError:
        print("El token ha expirado.")
        return None
    except jwt_exceptions.InvalidTokenError:
        print("Token inválido.")
        return None
    except Exception as e:  # Manejo general de excepciones
        print(f"Error al decodificar el token: {str(e)}")
        return None

@jwt.user_identity_loader
def user_identity_lookup(user):
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    user = mongo.db.users.find_one({'_id': ObjectId(identity)})
    return user
