from flask import Flask
from .auth import auth
from .blogs import blogs
from .categories import categories
from .chat import chat
from .permissions import permissions
from .public import public
from .products import products
from .roles import roles
from .users import users
from .tags import tags

def register_blueprints(app: Flask):
    app.register_blueprint(auth)
    app.register_blueprint(blogs)
    app.register_blueprint(categories)
    app.register_blueprint(chat)
    app.register_blueprint(permissions)
    app.register_blueprint(public)
    app.register_blueprint(products)
    app.register_blueprint(roles)
    app.register_blueprint(users)
    app.register_blueprint(tags)