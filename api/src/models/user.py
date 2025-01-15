from ..config  import mongo
from bson.objectid import ObjectId
from datetime import datetime
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

class User:
    def __init__(self, name, email, password, roles=[], role=None, email_verified_at=None, avatar=None, last_login_at=None, last_login_ip=None, profile_photo_path=None, is_active=True, is_delete=False):
        self.name = name
        self.email = email
        self.password = password
        self.email_verified_at = email_verified_at
        self.avatar = avatar
        self.last_login_at = last_login_at
        self.last_login_ip = last_login_ip
        self.profile_photo_path = profile_photo_path
        self.roles = [ObjectId(role) for role in roles] if roles else []
        self.role = role
        self.is_active = is_active
        self.is_delete = is_delete
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        user_data = {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "email_verified_at": self.email_verified_at,
            "avatar": self.avatar,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login_at": self.last_login_at,
            "last_login_ip": self.last_login_ip,
            "profile_photo_path": self.profile_photo_path,
            "roles": self.roles,
            "role": self.role,
            "is_active": self.is_active,
            "is_delete": self.is_delete
        }
        try:
            result = mongo.db.users.insert_one(user_data)
            return result.inserted_id
        except DuplicateKeyError:
            return {"error": "Correo ya existe, no puede repetirlo"}
        
    @staticmethod
    def initialize_indexes():
        mongo.db.users.create_index("email", unique=True)

    @staticmethod
    def get_user_by_id(user_id):
        return mongo.db.users.find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def get_user_by_id(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def update_user(user_id, updates):
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    
    @staticmethod
    def update_roles_and_user(user_id, roles):
        return mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},  # Filtro para encontrar el usuario
            {
                "$set": {"updated_at": datetime.utcnow()},  # Actualiza la marca de tiempo
                "$addToSet": {"roles": {"$each": [ObjectId(role) for role in roles]}}  # Agrega roles sin duplicados
            }
        )
    
    @staticmethod
    def active_user(user_id, option):
        updates = {
            "is_active": option,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

    @staticmethod
    def delete_user(user_id):
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})