from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..services import (register, login, me, change_password, change_email, user_update_post, forgot_password_post, reset_password_post)

auth = Blueprint('auth', __name__, url_prefix='/auth')

@auth.route('/register', methods=['POST'])
def post_register():
    return register()

@auth.route('/login', methods=['POST'])
def get_login():
    return login()

@auth.route('/change-password/<id>', methods=['POST'])
@jwt_required()
def post_change_password(id):
    return change_password(id)

@auth.route('/change-email/<id>', methods=['POST'])
@jwt_required()
def post_change_email(id):
    return change_email(id)

@auth.route('/forgot-password', methods=['POST'])
def post_forgot_password():
    return forgot_password_post()

@auth.route('/reset-password', methods=['POST'])
def post_reset_password():
    return reset_password_post()

@auth.route('/update-user/<id>', methods=['POST'])
@jwt_required()
def post_update_user(id):
    return user_update_post(id)

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_me_all():
    return me()