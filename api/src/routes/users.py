from flask import Blueprint
from ..services import (users_get, user_get, user_post, user_put, user_delete, user_active,get_online_users)
from flask_jwt_extended import jwt_required

users = Blueprint('users', __name__, url_prefix='/users')

@users.route('/all', methods=['POST'])
@jwt_required()
def get_users():
    return users_get()

@users.route('/<id>', methods=['GET'])
@jwt_required()
def get_user(id):
    return user_get(id)

@users.route('/on-line', methods=['GET'])
@jwt_required()
def online_user():
    return get_online_users()

@users.route('/create', methods=['POST'])
@jwt_required()
def post_user():
    return user_post()

@users.route('/active', methods=['POST'])
@jwt_required()
def active_user():
    return user_active()

@users.route('/<id>', methods=['PUT'])
@jwt_required()
def put_user(id):
    return user_put(id)

@users.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    return user_delete(id)