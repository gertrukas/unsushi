from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
import os
from src.config import init_app, socketio
from src.routes import register_blueprints
from src.models import User

environment = os.getenv('FLASK_ENV', 'dev')

if environment == 'dev':
    load_dotenv('.env')
elif environment == 'qa':
    load_dotenv('.env.qa')
elif environment == 'prod':
    load_dotenv('.env.prod')    

load_dotenv()

allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

app = Flask(__name__)
app.config['DEBUG'] = environment == 'dev'


# Inicialización de CORS
CORS(app, resources={r"/*": { "origins": allowed_origins }})

# Inicializa la configuración de las extensiones
init_app(app)  # Asegúrate de que esta función configure todo correctamente

register_blueprints(app)

# for rule in app.url_map.iter_rules():
#     print(rule)

bcrypt = Bcrypt(app)
bcrypt.init_app(app)

User.initialize_indexes()

# Configuración para subir archivos
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # Directorio de archivos subidos
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ruta para servir archivos subidos
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    if environment == 'dev':
        socketio.run(app, host="127.0.0.1", port=5000, debug=True)
    elif environment == 'qa':
        socketio.run(app, host="0.0.0.0", port=4401, debug=False)
    elif environment == 'prod':
        socketio.run(app, host="0.0.0.0", port=4301, debug=False)
