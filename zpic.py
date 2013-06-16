from libimport import *


jinja_environment=jinja2.Environment(
                                     loader=jinja2.FileSystemLoader(os.path.dirname(__file__))
                                     )
                                     
class BasePicHandler(BaseHandler):
    @property
    def data_class(self):
        return ZPicLife
    def get_records(self):
        upload_url_rpc = blobstore.create_upload_url_async('/upload')
        pageno=int(self.request.get('pageno',default_value='1'))
        record_infos=self.get_paged_record(self.data_class,pageno)
        user_env_vars=self.get_user_env_vars()
        upload_url = upload_url_rpc.get_result()

        template=jinja_environment.get_template('templates/zpic.html')
        template_values={
                    'page_title':'ZPics',
                    'upload_url':upload_url,
                    'record_infos':record_infos,
                    'user_env_vars':user_env_vars
                  }

        self.response.out.write(template.render(template_values))
        
    def update_records(self):
        actionType=self.request.get('actionType')

        if actionType=='insert':
            self.insert_new_record(self.data_class)
        elif actionType=='update':
            self.update_a_record(self.data_class)
        elif actionType=='delete':
            self.delete_a_record(self.data_class)

    
    def insert_new_record(self,data_class):
        try:
            user_env_vars=self.get_user_env_vars()
            author=self.request.get('author','')
            if author=='':
                author=user_env_vars.get('user_nickname','anonymous')
            email=self.request.get('email','')
            if email=='':
                email=user_env_vars.get('email',None)
            content=self.request.get('description')

            new_record=data_class()
            new_record.author=author
            new_record.content=content
            new_record.email=email
            new_record.put()
            json_string='{"status":"ok"}'

            self.response.out.write(json_string)
        except Exception as e:
            json_string='{"status":"fail", \
                        "message":"cannot update the record. %s"}'%e

            self.response.out.write(json_string)
    def update_a_record(self,data_class):
        try:
            user_env_vars=self.get_user_env_vars()
            author=user_env_vars.get('user_nickname','anonymous')
            email=user_env_vars.get('email',None)
            record_key=self.request.get('record_key')
            content=self.request.get('description')
            selected_record=data_class.get(record_key)
            selected_record.content=content
            selected_record.author=author
            selected_record.email=email
            selected_record.put()
            json_string='{"status":"ok"}'

            self.response.out.write(json_string)
        except Exception as e:
            json_string='{"status":"fail", \
                        "message":"cannot update the record. %s"}'%e

            self.response.out.write(json_string)
    def delete_a_record(self,data_class):
        try:
            record_key=self.request.get('record_key')
            selected_record=data_class.get(record_key)
            
            #delete the associated image
            image_key=str(selected_record.image_key)
            image_obj=blobstore.BlobInfo.get(blobstore.BlobKey(image_key))
            image_obj.delete()
            
            #delete the associated comments
            related_comments=Comment.all().filter('topic_key =',record_key).fetch(1000)
            for comment in related_comments:
                comment.delete()

            #delete the selected record
            selected_record.delete()

            json_string='{"status":"ok"}'

            self.response.out.write(json_string)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                        "message":"cannot delete the post. %s"}'%e

            self.response.out.write(json_string)
            
    def get_upload_url(self):
        try:
            upload_url= blobstore.create_upload_url('/upload')
            json_string='{"status":"ok", \
            "upload_url":"%s"}' %upload_url
            
            self.response.out.write(json_string)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                        "message":"cannot create the upload url. %s"}'%e

            self.response.out.write(json_string)
            

class ZPic(BasePicHandler):
    def get(self):
        dispatcher=self.request.get('dispatcher','get_records')
        if dispatcher=='get_records':
            self.get_records()
        elif dispatcher=='update_records':
            self.update_records()
        elif dispatcher=='get_comments':
            self.get_comments()
        elif dispatcher=='post_comment':
            self.post_comment()
        elif dispatcher=='get_upload_url':
            self.get_upload_url()

        elif dispatcher=='send_email':
            self.send_email()
    def post(self):
        self.get()

class RecordFileUpload(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            data_class=ZPicLife
            upload_files = self.get_uploads('record_file')  # 'file' is file upload field in the form
            blob_info = upload_files[0]
            blob_key=str(blob_info.key())
            image_url=images.get_serving_url(blob_key=blob_key)
            new_record=data_class()
            new_record.image_key=blob_key
            new_record.image_url=image_url
            new_record.content=''
            new_record.put()
            new_record_key=new_record.key()
            json_string='{"status":"ok", \
            "image_key":"%s", \
            "image_url":"%s", \
            "new_record_key":"%s"\
            }' % (blob_key, image_url,new_record_key)
            self.response.out.write(json_string)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                    "message":"cannot upload. %s"}' %e 
            self.response.out.write(json_string)
