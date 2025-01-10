from flask import Blueprint
from ..services import (permissions_get, permission_get, permission_post, permission_put, permission_delete, permission_active, permissions_data_table_get)
from flask_jwt_extended import jwt_required

permissions = Blueprint('permissions', __name__, url_prefix='/permissions')

@permissions.route('/all', methods=['POST'])
@jwt_required()
def get_permissions():
    return permissions_get()

@permissions.route('/data-table', methods=['GET'])
@jwt_required()
def get_data_table_permissions():
    return permissions_data_table_get()

@permissions.route('/<id>', methods=['GET'])
@jwt_required()
def get_permission(id):
    return permission_get(id)

@permissions.route('/create', methods=['POST'])
@jwt_required()
def post_permission():
    return permission_post()

@permissions.route('/active', methods=['POST'])
@jwt_required()
def active_permission():
    return permission_active()

@permissions.route('/<id>', methods=['PUT'])
@jwt_required()
def put_permission(id):
    return permission_put(id)

@permissions.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_permission(id):
    return permission_delete(id)