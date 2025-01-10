from flask import Blueprint
from ..config import socketio
from ..services import (message_handle, chat_group_get, chat_private_get)

chat = Blueprint('chat', __name__, url_prefix='/chats')

@chat.route('/')
def index():
    return "Chat server running"

@socketio.on('message')
def handle_message(msg):
    return message_handle(msg)

@chat.route('/chat-group', methods=['GET'])
def get_chat_group():
    return chat_group_get()

@chat.route('/chats-private', methods=['POST'])
def get_chat_private():
    return chat_private_get()