from ..config  import mongo
from bson.objectid import ObjectId
from datetime import datetime
from bson import ObjectId

class Category:
    def __init__(self, is_new, image=None, is_active=True, is_delete=False, default_language="es"):
        self.is_new = is_new            # Estado de "nuevo" (1 o 0)
        self.image = image      # URL de la foto del categoria
        self.default_language = default_language
        self.is_active = is_active      # Estado de "activo" (por defecto en True)
        self.is_delete = is_delete      # Estado de "eliminacion" (por defecto en False)
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        # Inserta el documento en la colección de categorias
        category_data = {
            "is_new": self.is_new,
            "image": self.image,
            "default_language": self.default_language,
            "is_active": self.is_active,
            "is_delete": self.is_delete,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        result = mongo.db.categories.insert_one(category_data)
        return result.inserted_id

    @staticmethod
    def get_category_by_id(category_id):
        # Busca un categoria por su ID
        return mongo.db.categories.find_one({"_id": ObjectId(category_id)})

    @staticmethod
    def update_category(category_id, updates):
        # Actualiza un categoria con los datos especificados
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": updates})
    
    @staticmethod
    def active_category(category_id, option):
        # Actualiza un categoria con los datos especificados
        updates = {
            "is_active": option,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": updates})

    @staticmethod
    def delete_category(category_id):
        # Elimina un categoria por su ID
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.categories.update_one({"_id": ObjectId(category_id)}, {"$set": updates})
    
class CategoryTranslation:
    def __init__(self, category, language, name, slug, intro, description, section):
        self.category = ObjectId(category)
        self.language = language
        self.name = name                # Slug del categoria
        self.slug = slug                # Slug del categoria
        self.intro = intro              # Breve introducción
        self.description = description  # Descripción completa
        self.section = section  # Seccion completa

    def save(self):
        translation_data = {
            "category": self.category,
            "language": self.language,
            "name": self.name,
            "slug": self.slug,
            "intro": self.intro,
            "description": self.description,
            "section": self.section
        }
        result = mongo.db.category_translations.insert_one(translation_data)
        return result.inserted_id    
    
    @staticmethod
    def get_category_translation_by_id(category_id):
        # Busca un categoria por su ID
        return mongo.db.category_translations.find_one({"_id": ObjectId(category_id)})
    
    @staticmethod
    def get_categories_translation_by_category_id(category_id):
        # Busca un categoria por su ID
        return mongo.db.category_translations.find({"category": ObjectId(category_id)})

    @staticmethod
    def update_category_translation(category_id, updates):
        # Actualiza un categoria con los datos especificados
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.category_translations.update_one({"_id": ObjectId(category_id)}, {"$set": updates})

    @staticmethod
    def delete_category_translation(category_id):
        # Elimina un categoria por su ID
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.category_translations.update_one({"_id": ObjectId(category_id)}, {"$set": updates})