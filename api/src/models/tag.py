from ..config  import mongo
from bson.objectid import ObjectId
from datetime import datetime
from bson import ObjectId

class Tag:
    def __init__(self, parent, categories=None, image=None, is_active=True, is_delete=False, default_language="es", images=None):
        self.parent = parent
        self.image = image
        self.categories = [ObjectId(category) for category in categories] if categories else []
        self.default_language = default_language
        self.images = images if images is not None else []
        self.is_active = is_active
        self.is_delete = is_delete 
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        tag_data = {
            "parent": self.parent,
            "image": self.images,
            "categories": [ObjectId(category) for category in self.categories],
            "default_language": self.default_language,
            "images": [image for image in self.images],
            "is_active": self.is_active,
            "is_delete": self.is_delete
        }
        result = mongo.db.tags.insert_one(tag_data)
        return result.inserted_id

    @staticmethod
    def get_tag_by_id(tag_id):
        return mongo.db.tags.find_one({"_id": ObjectId(tag_id)})

    @staticmethod
    def get_tags_by_category(category):
        return list(mongo.db.tags.find({"category": category}))

    @staticmethod
    def update_tag(tag_id, updates):
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.tags.update_one({"_id": ObjectId(tag_id)}, {"$set": updates})
    
    @staticmethod
    def active_tag(tag_id, option):
        updates = {
            "is_active": option,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.tags.update_one({"_id": ObjectId(tag_id)}, {"$set": updates})

    @staticmethod
    def delete_tag(tag_id):
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.tags.update_one({"_id": ObjectId(tag_id)}, {"$set": updates})
    
class TagTranslation:
    def __init__(self, tag, language, name, slug, intro, description,):
        self.tag = ObjectId(tag)
        self.language = language
        self.name = name
        self.slug = slug
        self.intro = intro
        self.description = description

    def save(self):
        translation_data = {
            "tag": self.tag,
            "language": self.language,
            "name": self.name,
            "slug": self.slug,
            "intro": self.intro,
            "description": self.description
        }
        result = mongo.db.tag_translations.insert_one(translation_data)
        return result.inserted_id
    
    @staticmethod
    def get_tag_translation_by_id(tag_id):
        return mongo.db.tag_translations.find_one({"_id": ObjectId(tag_id)})
    

    @staticmethod
    def get_tags_translation_by_tag_id(tag_id):
        return mongo.db.tag_translations.find({"tag": ObjectId(tag_id)})


    @staticmethod
    def update_tag_translation(tag_id, updates):
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.tag_translations.update_one({"_id": ObjectId(tag_id)}, {"$set": updates})

    @staticmethod
    def delete_tag_translation(tag_id):
        updates = {"is_delete": True}
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.tag_translations.update_one({"_id": ObjectId(tag_id)}, {"$set": updates})