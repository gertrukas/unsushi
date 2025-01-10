from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..services import (
    tags_get,
    tags_data_table_get,
    tag_get,
    tag_active,
    tag_post,
    tag_put,
    tag_delete,
    image_gallery_tag_delete
)

tags = Blueprint('tags', __name__, url_prefix='/tags')

@tags.route('/all', methods=['GET'])
@jwt_required()
def get_tags():
    return tags_get()

@tags.route('/data-table', methods=['GET'])
@jwt_required()
def get_tags_data_table():
    return tags_data_table_get()

@tags.route('/<id>', methods=['GET'])
@jwt_required()
def get_tag(id):
    return tag_get(id)

@tags.route('/create', methods=['POST'])
@jwt_required()
def post_tag():
    return tag_post()

@tags.route('/active', methods=['POST'])
@jwt_required()
def active_tag():
    return tag_active()

@tags.route('/<id>', methods=['PUT'])
@jwt_required()
def put_tag(id):
    return tag_put(id)


@tags.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_tag(id):
    return tag_delete(id)

@tags.route('/gallery/<id>/<img>', methods=['DELETE'])
@jwt_required()
def delete_image_gallery_tag(id, img):
    return image_gallery_tag_delete(id, img)
