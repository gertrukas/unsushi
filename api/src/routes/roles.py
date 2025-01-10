from flask import Blueprint
from ..services import (roles_get, role_get, role_post, role_put, role_delete, role_active, role_users_post)
from flask_jwt_extended import jwt_required

roles = Blueprint('roles', __name__, url_prefix='/roles')

@roles.route('/all', methods=['POST'])
@jwt_required()
def get_roles():
    return roles_get()

@roles.route('/<id>', methods=['GET'])
@jwt_required()
def get_role(id):
    return role_get(id)

@roles.route('/create', methods=['POST'])
@jwt_required()
def post_role():
    return role_post()

@roles.route('/active', methods=['POST'])
@jwt_required()
def active_role():
    return role_active()

@roles.route('/users-all', methods=['POST'])
@jwt_required()
def post_role_users():
    return role_users_post()

@roles.route('/<id>', methods=['PUT'])
@jwt_required()
def put_role(id):
    return role_put(id)

@roles.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_role(id):
    return role_delete(id)