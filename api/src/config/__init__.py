import os
from .jwtmanager import jwt
from .mail import mail
from .mongodb import mongo
from .socketio import socketio
from datetime import timedelta

def init_app(app):
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')  # Asegúrate de establecer esto aquí
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Expiración del token de renovación
    app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
    jwt.init_app(app)
    mail.init_app(app)
    mongo.init_app(app)
    socketio.init_app(app)