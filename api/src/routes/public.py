from flask import Blueprint
from ..services import (search_get_all)
from flask_jwt_extended import jwt_required

public = Blueprint('public', __name__, url_prefix='/public')

@public.route('/search-all', methods=['POST'])
def get_search_all():
    return search_get_all()