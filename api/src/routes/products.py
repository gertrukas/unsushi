from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..services import (
    products_get,
    products_data_table_get,
    product_get,
    product_active,
    product_post,
    product_put,
    product_delete,
    image_gallery_product_delete
)

products = Blueprint('products', __name__, url_prefix='/products')

@products.route('/all', methods=['GET'])
@jwt_required()
def get_products():
    return products_get()

@products.route('/data-table', methods=['GET'])
@jwt_required()
def get_products_data_table():
    return products_data_table_get()

@products.route('/<id>', methods=['GET'])
@jwt_required()
def get_product(id):
    return product_get(id)

@products.route('/create', methods=['POST'])
@jwt_required()
def post_product():
    return product_post()

@products.route('/active', methods=['POST'])
@jwt_required()
def active_product():
    return product_active()

@products.route('/<id>', methods=['PUT'])
@jwt_required()
def put_product(id):
    return product_put(id)


@products.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    return product_delete(id)

@products.route('/gallery/<id>/<img>', methods=['DELETE'])
@jwt_required()
def delete_image_gallery_product(id, img):
    return image_gallery_product_delete(id, img)
