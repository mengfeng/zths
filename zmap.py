from libimport import *


jinja_environment=jinja2.Environment(
                                     loader=jinja2.FileSystemLoader(os.path.dirname(__file__))
                                     )
                                     
class BaseMapHandler(Location):
    pass

class ZMAP(BaseMapHandler):
    def get(self):
        user_env_vars=self.get_user_env_vars()
        
        template=jinja_environment.get_template('templates/zmap.html')
        template_values={
            'page_title':'ZMAP',
            'user_env_vars':user_env_vars,
        }

        self.response.out.write(template.render(template_values))