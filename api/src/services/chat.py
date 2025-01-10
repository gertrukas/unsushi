from flask import request, Response
from bson import ObjectId
from ..config  import mongo
from flask import jsonify
from datetime import datetime
from flask_socketio import send

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

def message_handle(msg):
    now = datetime.now()
    formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")
    data = {
        'userSend': msg['userId'],
        'message': msg['text'],
        'timestamp': formatted_date,
        'userReceiving': msg['userReceiving'],
    }
    mongo.db.chat.insert_one(data)
    send(msg, broadcast=True)


def chat_group_get():
    chats = []
    # Realizar la consulta a MongoDB
    cursor = mongo.db.chat.find({"userReceiving": 'group'})
    chat_list = list(cursor)  # Convertir el cursor a una lista
    populated_chats = []
    for chat in chat_list:
        # Obtener los IDs de usuario
        user1_id = chat.get('userSend')
        user2_id = chat.get('userReceiving')

        # Inicializar la lista de usuarios
        userSend = {}
        userReceiving = 'group'

        # Consultar detalles de user1
        if user1_id:
            user1 = mongo.db.users.find_one({'_id': ObjectId(user1_id)})
            if user1:
                userSend = {
                    '_id': str(user1['_id']),
                    'username': user1['name']
                }

        # Consultar detalles de user2
        if user2_id and user2_id != 'group':
            user2 = mongo.db.users.find_one({'_id': ObjectId(user2_id)})
            if user2:
                userReceiving = {
                    '_id': str(user2['_id']),
                    'username': user2['name']
                }

        # Agregar chat con usuarios poblados a la lista
        populated_chat = {
            'chat_id': str(chat['_id']),
            'userSend': userSend,
            'userReceiving': userReceiving,
            'time': chat.get('timestamp'),
            'message': chat.get('message')
        }
        populated_chats.append(populated_chat)

    chats = serialize_object(populated_chats)
    response = jsonify(chats)
    response.status_code = 200
    return response


def chat_private_get():
    params = request.get_json()
    userSend = params.get('userSend')
    userReceiving = params.get('userReceiving')
    chats = []
    # Realizar la consulta a MongoDB
    cursor = mongo.db.chat.find({
        '$or': [
            {'userSend': userSend, 'userReceiving': userReceiving},
            {'userSend': userReceiving, 'userReceiving': userSend}
        ]
    })
    chat_list = list(cursor)  # Convertir el cursor a una lista

    populated_chats = []

    for chat in chat_list:
        # Obtener los IDs de usuario
        user1_id = chat.get('userSend')
        user2_id = chat.get('userReceiving')


        if user1_id:
            user1 = mongo.db.users.find_one({'_id': ObjectId(user1_id)})
            if user1:
                userSend = {
                    '_id': str(user1['_id']),
                    'username': user1['name']
                }

        # Consultar detalles de user2
        if user2_id and user2_id != 'group':
            user2 = mongo.db.users.find_one({'_id': ObjectId(user2_id)})
            if user2:
                userReceiving = {
                    '_id': str(user2['_id']),
                    'username': user2['name']
                }

        # Agregar chat con usuarios poblados a la lista
        populated_chat = {
            'chat_id': str(chat['_id']),
            'userSend': userSend,
            'userReceiving': userReceiving,
            'time': chat.get('timestamp'),
            'message': chat.get('message')
        }
        populated_chats.append(populated_chat)

    chats = serialize_object(populated_chats)
    response = jsonify(chats)
    response.status_code = 200
    return response