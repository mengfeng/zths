from google.appengine.ext import db

class Dream(db.Model):
    author=db.StringProperty()
    content=db.TextProperty()
    date=db.DateTimeProperty(auto_now_add=True)
    location=db.GeoPtProperty()
    email=db.EmailProperty()
    
class ZPicLife(db.Model):
    author=db.StringProperty()
    content=db.TextProperty()
    date=db.DateTimeProperty(auto_now_add=True)
    location=db.GeoPtProperty()
    email=db.EmailProperty()
    image_key=db.StringProperty()
    image_url=db.LinkProperty()
    
class ZThoughts(db.Model):
    author=db.StringProperty()
    title=db.StringProperty()
    content=db.TextProperty()
    date=db.DateTimeProperty(auto_now_add=True)
    location=db.GeoPtProperty()
    email=db.EmailProperty()
    
class Comment(db.Model):
    created=db.DateTimeProperty(auto_now_add=True)
    author=db.StringProperty()
    comment_content=db.StringProperty()
    email=db.EmailProperty()
    location=db.GeoPtProperty()
    topic_key=db.StringProperty()
    
class MessageToZ(db.Model):
    author=db.StringProperty()
    content=db.TextProperty()
    date=db.DateTimeProperty(auto_now_add=True)
    location=db.GeoPtProperty()
    email=db.EmailProperty()
    
class RequestorLocation(db.Model):
    date=db.DateTimeProperty(auto_now_add=True)
    updated= db.DateTimeProperty(auto_now=True)
    browser_type=db.StringProperty()
    ip_address=db.StringProperty()
    location_country=db.StringProperty()
    location_city=db.StringProperty()
    latitude=db.StringProperty()
    longitude=db.StringProperty()
    comment=db.StringProperty()
    requests_count=db.IntegerProperty()
    formatted_address=db.StringProperty()
    locating_method=db.StringProperty()