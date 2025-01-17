from flask import Blueprint
from ..services import (search_get_all, products_public_get, product_public_get)
from flask_jwt_extended import jwt_required

public = Blueprint('public', __name__, url_prefix='/public')

@public.route('/search-all', methods=['POST'])
def get_search_all():
    return search_get_all()


@public.route('/products', methods=['POST'])
def get_products():
    return products_public_get()


@public.route('/product', methods=['POST'])
def get_product():
    return product_public_get()