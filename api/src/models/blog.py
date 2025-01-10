from ..config  import mongo
from bson.objectid import ObjectId
from datetime import datetime
from bson import ObjectId

class Blog:
    def __init__(self, image=None, is_active=True, is_delete=False, default_language="es", images=None):
        self.image = image
        self.default_language = default_language
        self.images = images if images is not None else []
        self.is_active = is_active
        self.is_delete = is_delete
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        blog_data = {
            "image": self.images,
            "default_language": self.default_language,
            "images": [image for image in self.images],
            "is_active": self.is_active,
            "is_delete": self.is_delete,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        result = mongo.db.blogs.insert_one(blog_data)
        return result.inserted_id

    @staticmethod
    def get_blog_by_id(blog_id):
        return mongo.db.blogs.find_one({"_id": ObjectId(blog_id)})


    @staticmethod
    def update_blog(blog_id, updates):
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": updates})
    
    @staticmethod
    def active_blog(blog_id, option):
        updates = {
            "is_active": option,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": updates})

    @staticmethod
    def delete_blog(blog_id):
        updates = {
            "is_delete": True,
            'updated_at': datetime.utcnow()
        }
        return mongo.db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": updates})
    
class BlogTranslation:
    def __init__(self, blog, language, name, slug, intro, description,):
        self.blog = ObjectId(blog)
        self.language = language
        self.name = name
        self.slug = slug
        self.intro = intro
        self.description = description

    def save(self):
        translation_data = {
            "blog": self.blog,
            "language": self.language,
            "name": self.name,
            "slug": self.slug,
            "intro": self.intro,
            "description": self.description
        }
        result = mongo.db.blog_translations.insert_one(translation_data)
        return result.inserted_id
    
    @staticmethod
    def get_blog_translation_by_id(blog_id):
        return mongo.db.blog_translations.find_one({"_id": ObjectId(blog_id)})
    

    @staticmethod
    def get_blogs_translation_by_blog_id(blog_id):
        return mongo.db.blog_translations.find({"blog": ObjectId(blog_id)})


    @staticmethod
    def update_blog_translation(blog_id, updates):
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.blog_translations.update_one({"_id": ObjectId(blog_id)}, {"$set": updates})

    @staticmethod
    def delete_blog_translation(blog_id):
        updates = {"is_delete": True}
        updates['updated_at'] = datetime.utcnow()
        return mongo.db.blog_translations.update_one({"_id": ObjectId(blog_id)}, {"$set": updates})