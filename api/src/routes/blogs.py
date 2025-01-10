from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..services import (
    blogs_get,
    blogs_data_table_get,
    blog_get,
    blog_active,
    blog_post,
    blog_put,
    blog_delete,
    image_gallery_blog_delete
)

blogs = Blueprint('blogs', __name__, url_prefix='/blogs')

@blogs.route('/all', methods=['GET'])
@jwt_required()
def get_blogs():
    return blogs_get()

@blogs.route('/data-table', methods=['GET'])
@jwt_required()
def get_blogs_data_table():
    return blogs_data_table_get()

@blogs.route('/<id>', methods=['GET'])
@jwt_required()
def get_blog(id):
    return blog_get(id)

@blogs.route('/create', methods=['POST'])
@jwt_required()
def post_blog():
    return blog_post()

@blogs.route('/active', methods=['POST'])
@jwt_required()
def active_blog():
    return blog_active()

@blogs.route('/<id>', methods=['PUT'])
@jwt_required()
def put_blog(id):
    return blog_put(id)


@blogs.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_blog(id):
    return blog_delete(id)

@blogs.route('/gallery/<id>/<img>', methods=['DELETE'])
@jwt_required()
def delete_image_gallery_blog(id, img):
    return image_gallery_blog_delete(id, img)
