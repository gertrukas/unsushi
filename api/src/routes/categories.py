from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..services import (
    categories_get,
    categories_data_table_get,
    category_get,
    category_active,
    category_post,
    category_put,
    category_delete
)

categories = Blueprint('categories', __name__, url_prefix='/categories')

@categories.route('/all', methods=['GET'])
@jwt_required()
def get_categories():
    return categories_get()

@categories.route('/data-table', methods=['GET'])
def get_data_table_categories():
    return categories_data_table_get()

@categories.route('/<id>', methods=['GET'])
@jwt_required()
def get_category(id):
    return category_get(id)

@categories.route('/create', methods=['POST'])
@jwt_required()
def post_category():
    return category_post()

@categories.route('/active', methods=['POST'])
@jwt_required()
def active_category():
    return category_active()

@categories.route('/<id>', methods=['PUT'])
@jwt_required()
def put_category(id):
    return category_put(id)

@categories.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    return category_delete(id)

