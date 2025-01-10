from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

environment = os.getenv('FLASK_ENV', 'dev')

if environment == 'dev':
    load_dotenv('.env.dev')
elif environment == 'qa':
    load_dotenv('.env.qa')
elif environment == 'prod':
    load_dotenv('.env.prod')

load_dotenv()

allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

socketio = SocketIO(cors_allowed_origins=allowed_origins, async_mode='eventlet')