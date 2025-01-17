from ..config  import mongo
from bson.objectid import ObjectId
from datetime import datetime
from bson import ObjectId

class Product:
    def __init__(self, model, key, dimensions, is_new, categories=None, image=None, is_active=True, is_delete=False, default_language="es", images=None):
        self.model = model              # Modelo del producto
        self.key = key                  # Clave del producto
        self.is_new = is_new            # Estado de "nuevo" (1 o 0)
        self.dimensions = dimensions    # Dimensiones del producto
        self.image = image      # URL de la foto del producto
        self.categories = [ObjectId(category) for category in categories] if categories else []        # Categoría del producto
        self.default_language = default_language
        self.images = images if images is not None else []
        self.is_active = is_active      # Estado de "activo" (por defecto en True)
        self.is_delete = is_delete      # Estado de "eliminacion" (por defecto en False)
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        # Inserta el documento en la colección de productos
        product_data = {
            "model": self.model,
            "key": self.key,
            "is_new": self.is_new,
            "dimensions": self.dimensions,
            "image": self.images,
            "categories": [ObjectId(category) for category in self.categories],
            "default_language": self.default_language,
            "images": [image for image in self.images],
            "is_active": self.is_active,
            "is_delete": self.is_delete
        }
        result = mongo.db.products.insert_one(product_data)
        return result.inserted_id

    @staticmethod
    def get_product_by_id(product_id):
        # Busca un producto por su ID
        return mongo.db.products.find_one({"_id": ObjectId(product_id)})

    @staticmethod
    def get_products_by_category(category):
        # Busca productos por categoría
        return list(mongo.db.products.find({"category": category}))

    @staticmethod
    def update_product(product_id, updates):
        # Actualiza un producto con los datos especificados
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
    
    @staticmethod
    def get_pagination_products(query, start, length):
        # Actualiza un producto con los datos especificados
        return list(mongo.db.products.find(query)
                                .skip(start)
                                .limit(length))
    
    @staticmethod
    def active_product(product_id, option):
        # Elimina un producto por su ID
        updates = {
            "is_active": option,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updates})

    @staticmethod
    def delete_product(product_id):
        # Elimina un producto por su ID
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.products.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
    
class ProductTranslation:
    def __init__(self, product, language, name, slug, intro, description,):
        self.product = ObjectId(product)
        self.language = language
        self.name = name                # Slug del producto
        self.slug = slug                # Slug del producto
        self.intro = intro              # Breve introducción
        self.description = description  # Descripción completa

    def save(self):
        translation_data = {
            "product": self.product,
            "language": self.language,
            "name": self.name,
            "slug": self.slug,
            "intro": self.intro,
            "description": self.description
        }
        result = mongo.db.product_translations.insert_one(translation_data)
        return result.inserted_id
    
    @staticmethod
    def get_pagination_products_translation(query, start, length):
        return list(mongo.db.product_translations.find(query)
                                .skip(start)
                                .limit(length))
    
    @staticmethod
    def get_product_translation_by_id(product_id):
        # Busca un producto por su ID
        return mongo.db.product_translations.find_one({"_id": ObjectId(product_id)})
    
    @staticmethod
    def get_product_translation_by_slug(slug):
        # Busca un producto por su ID
        return mongo.db.product_translations.find_one({"slug": slug})
    

    @staticmethod
    def get_products_translation_by_product_id(product_id):
        # Busca un producto por su ID
        return mongo.db.product_translations.find({"product": ObjectId(product_id)})


    @staticmethod
    def update_product_translation(product_id, updates):
        # Actualiza un producto con los datos especificados
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.product_translations.update_one({"_id": ObjectId(product_id)}, {"$set": updates})

    @staticmethod
    def delete_product_translation(product_id):
        # Elimina un producto por su ID
        updates = {"is_delete": True}
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.product_translations.update_one({"_id": ObjectId(product_id)}, {"$set": updates})