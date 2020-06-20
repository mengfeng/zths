# -*- coding: utf-8 -*-
import webapp2
import datetime
from google.appengine.api import users
from config import *
import lib.paging as paging
import lib.PyRSS2Gen as rssGen
import lib.plistlib as plistlib
import lib.markdown as markdown
import lib.html2md as html2md
import traceback
import logging
import urllib
import jinja2
import os
from models import *

try:
    import json
except:
    import simplejson as json


jinja_environment=jinja2.Environment(
                                    loader=jinja2.FileSystemLoader(os.path.dirname(__file__))
                                         )

class BaseHandler(webapp2.RequestHandler):
    @property
    def data_classes(self):
        return [Dream,ZPicLife,ZThoughts,MessageToZ]
    @property
    def data_classes_dict(self):
        data_classes_dict={'Dream':Dream,
        'ZPicLife':ZPicLife,
        'ZThoughts':ZThoughts,
        'MessageToZ':MessageToZ
        }
        
        return data_classes_dict
        
    def get_user_env_vars(self):
        user_env_vars={}
        user=users.get_current_user()
        user_env_vars['user']=user
        user_env_vars['user_nickname']=None
        user_env_vars['email']=None
        user_env_vars['is_admin']=False
        user_env_vars['action_url']=""
        user_env_vars['loggedin']=False
        if user_env_vars['user']: 
            user_env_vars['loggedin']=True
            user_env_vars['action_url']=users.create_logout_url('/')
            user_env_vars['user_nickname']=user.nickname()
            user_env_vars['email']=user.email()
            user_env_vars['is_admin']=users.is_current_user_admin()

        else: 
            user_env_vars['loggedin']=False
            user_env_vars['action_url']=users.create_login_url()
            user_env_vars['user_nickname']='anonymous'

        return user_env_vars
        
    def get_paged_record(self,data_class,pageno):
        pageinfo={}
        q=data_class.all().order('-date')
        paged_record=paging.PagedQuery(q,PAGE_SIZE)
        pageinfo['page_count']=paged_record.page_count()
        if pageno>1:
            pageinfo['results']=paged_record.fetch_page(pageno)
        else:
            pageinfo['results']=paged_record.fetch_page()
        if pageno<pageinfo['page_count']:
            pageinfo['next_page_exists']=True
            pageinfo['next_page']=pageno+1
        else:
            pageinfo['next_page_exists']=False
            pageinfo['next_page']=None
        if pageno>1:
            pageinfo['prev_page_exists']=True
            pageinfo['prev_page']=pageno-1
        else:
            pageinfo['prev_page_exists']=False
            pageinfo['prev_page']=None
        pageinfo['page_numbers']=[i for i in range(1,pageinfo['page_count']+1)]
        pageinfo['page_numbers']=self._get_page_number_list(pageno,PAGE_WING_SIZE,pageinfo['page_count'])

        return pageinfo
    def _get_page_number_list(self,pageno,wing_size,page_count):
        start_page_no=max(1,pageno-wing_size/2)
        end_page_no=min(page_count,start_page_no+wing_size)
        if end_page_no==page_count:
            start_page_no=max(1,end_page_no-wing_size)
        return [i for i in range(start_page_no,end_page_no+1)]
    
    def get_comments(self):
        try:
            topic_key=self.request.get('topic_key')
            json_dict={}
            json_dict['comments']=[]
            json_dict['topic_key']=topic_key
            results=Comment.all().filter('topic_key =',topic_key).order('-created').fetch(MAXCOMMENTS)
            json_dict['comments_count']=str(len(results))
            json_dict['status']='ok'
            for result in results:
                currentresult={'created':str(result.created.strftime('%a,%e %b %G %H:%M:%S GMT')),
                'author':result.author,
                'comment_content':result.comment_content,
                'location':result.location,
                'email':result.email
                }
                json_dict['comments'].append(currentresult)

            json_str=json.dumps(json_dict)
            self.response.out.write(json_str)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                        "message":"cannot get all comments."}'

            self.response.out.write(json_string)

    def post_comment(self):
        topic_key=self.request.get('topic_key')
        author=self.request.get('author')
        comment_content=self.request.get('comment_content')
        try:
            new_comment=Comment()
            new_comment.topic_key=topic_key
            new_comment.comment_content=comment_content
            new_comment.author=author
            new_comment.put()
            json_string='{"status":"ok"}'
            self.response.out.write(json_string)
        except Exception as e:
            json_string='{"status":"fail", \
                        "message":"cannot post the comment. %s"}'%e

            self.response.out.write(json_string)
    def get_records(self):
        pass
    def update_records(self):
        pass
    def insert_new_record(self,data_class):
        pass
    def update_a_record(self,data_class):
        pass
    def delete_a_record(self,data_class):
        pass

    def get_all_rss_items(self):
        data_classes=self.data_classes
        list_data_classes=[]
        
        for data_class in data_classes:
            list_data_classes.append(data_class.all().order('-date').fetch(1000))
        
        list_data_items=self._get_dict_data_items(list_data_classes)
        list_rss_items=[]

        for data_item in list_data_items:
            
            try:
                if data_item.title!="":
                    title=data_item.title
                else:
                    title=data_item.content[:30]
            except:
                title=data_item.content[:30]
            
            link="http://zinthedream.appspot.com"
            try:
                if data_item.image_url !="":
                    image_content="<img src='%s'/><br>"% data_item.image_url
                else:
                    image_content=""
            except:
                image_content=""
            description=image_content+data_item.content
            guid=rssGen.Guid("")
            pubDate=data_item.date
            author=data_item.author
            tempRssItem=rssGen.RSSItem(title=title, link=link, description=description,guid=guid, author=author,pubDate=pubDate)
            list_rss_items.append(tempRssItem)
        return list_rss_items
    
    def _get_dict_data_items(self,list_data_classes):
        list_data_items=[]
        for list_data_class in list_data_classes:
            list_data_items+=list_data_class
            
        list_data_items.sort(key=lambda data_item: data_item.date)
        list_data_items.reverse()
        return list_data_items
        
    def get_json_items_by_data_class(self,data_class):
        try:
            json_dict={}
            json_dict['records']=[]
            results=self.data_classes_dict.get(data_class).all().order('-date').fetch(1000)
            json_dict['records_count']=str(len(results))
            json_dict['status']='ok'
            for result in results:
                trimmed_content=result.content.replace('<br>','\n').replace('<br/>','\n').replace('<BR>','\n')
                try:
                    image_url=result.image_url
                except:
                    image_url=""
                try:
                    record_title=result.title.replace('<br>','\n').replace('<br/>','\n').replace('<BR>','\n')
                except:
                    record_title=trimmed_content[:15]
                currentresult={'created':str(result.date.strftime('%a,%e %b %G %H:%M:%S GMT')),
                'author':result.author,
                'record_content':trimmed_content,
                'location':result.location,
                'email':result.email,
                'record_key': str(result.key()),
                'record_title':record_title,
                'image_url':image_url
                
                }
                json_dict['records'].append(currentresult)

            json_str=json.dumps(json_dict)
            self.response.out.write(json_str)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                        "message":"cannot get all records."}'

            self.response.out.write(json_string)
        
        
class RSS(BaseHandler):
    def get(self):
        try:
            title="Z IN THE DREAM"
            link="http://zinthedream.appspot.com/"
            description="Dream a Dream and Live in That Dream--Z"
            rss_items=self.get_all_rss_items()
            rss=rssGen.RSS2(
                        title=title,
                        link=link,
                        description=description,
                        lastBuildDate=datetime.datetime.utcnow(),
                        items=rss_items
                            )
            self.response.headers['Content-Type']="text/xml"
            self.response.out.write(rss.to_xml())
        except Exception as e:
            traceback.print_exc()
            xml_output="<error>Error: %s</error>" %e
            self.response.headers['Content-Type']="text/xml"
            self.response.out.write(xml_output)
            
class RPC(BaseHandler):
    def get(self):
        self.handle_rpc_call()
    def post(self):
        self.handle_rpc_call()
    def handle_rpc_call(self):
        dispatcher=self.request.get('dispatcher')
        if dispatcher=='get_records':
            data_class=self.request.get('data_class','')
            if data_class != '':
                self.get_json_items_by_data_class(data_class)
                
class Robot(BaseHandler):
    def get(self):
        template=jinja_environment.get_template('templates/robots.txt')
        template_values={
                  }

        self.response.out.write(template.render(template_values))

class Location(BaseHandler):
    def post(self):
        self.location()
    def location(self):
        dispatcher=self.request.get('dispatcher',"")
        if dispatcher=='get_by_html5':
            self.record_location_by_html5();
        elif dispatcher=='get_by_ip':
            self.record_location_by_ip();
        elif dispatcher=='get_locations':
            self.get_locations();
    def get_locations(self):
        try:
            json_dict={}
            json_dict['requestor_locations']=[]
            results=RequestorLocation.all().order('-updated').fetch(2)
            json_dict['requestor_locations_count']=str(len(results))
            json_dict['status']='ok'
            for result in results:
                currentresult={'date':str(result.date.strftime('%a,%e %b %G %H:%M:%S GMT')),
                'longitude':result.longitude,
                'latitude':result.latitude,
                'ip_address':result.ip_address,
                'location_country':result.location_country,
                'location_city':result.location_city,
                'browser_type':result.browser_type,
                'requests_count': str(result.requests_count),
                }
                json_dict['requestor_locations'].append(currentresult)

            json_str=json.dumps(json_dict)
            self.response.out.write(json_str)
        except Exception as e:
            traceback.print_exc()
            json_string='{"status":"fail", \
                        "message":"cannot get all locations. %s"}'%e

            self.response.out.write(json_string)
            
    def record_location_by_html5(self):
        browser_type=self.request.get('browser_type','not available');
        longitude=self.request.get('longitude',"");
        latitude=self.request.get('latitude',"");
        locating_method=self.request.get('locating_method');
        comment=self.request.get('comment',"")
        ip_address=self.request.remote_addr;
        location_country,location_city, formatted_address=self.get_address_by_latlng(latitude,longitude)
        
        if len(longitude)>1 and len(latitude)>1 and locating_method!="":
            location_info={
            'browser_type':browser_type,
            'longitude':longitude,
            'latitude':latitude,
            'locating_method':locating_method,
            'location_country':location_country,
            'location_city': location_city,
            'comment':comment,
            'ip_address':ip_address,
            'formatted_address':formatted_address,
            }
            try:
                self.record_location_info(location_info)
                json_str='{"status":"ok"}'
                self.response.out.write(json_str)
            except Exception as e:
                traceback.print_exc()
                json_str='{"status":"fail", \
                "message":"cannot record the current location. %s"}'%e
                self.response.out.write(json_str)
    
    def record_location_by_ip(self):
        browser_type=self.request.get('browser_type','not available');
        comment=self.request.get('comment',"")
        locating_method=self.request.get('locating_method');
        ip_address=self.request.remote_addr;
        latitude, longitude=self.get_geolocation_by_ip_using_api(ip_address)
        location_country,location_city,formatted_address=self.get_address_by_latlng(latitude,longitude)
        if len(longitude)>1 and len(latitude)>1 and locating_method!="":
            location_info={
            'browser_type':browser_type,
            'longitude':longitude,
            'latitude':latitude,
            'locating_method':locating_method,
            'location_country':location_country,
            'location_city': location_city,
            'comment':comment,
            'ip_address':ip_address,
            'formatted_address':formatted_address,
            }
            try:
                self.record_location_info(location_info)
                json_str='{"status":"ok"}'
                self.response.out.write(json_str)
            except Exception as e:
                traceback.print_exc()
                json_str='{"status":"fail", \
                "message":"cannot record the current location. %s"}'%e
                self.response.out.write(json_str)

    
    def record_location_info(self,location_info):
        requestor_location=self.get_requestor_from_record_by_ip(location_info.get('ip_address'))
        if not requestor_location:
            requestor_location=RequestorLocation()
            requestor_location.browser_type=location_info.get('browser_type')
            requestor_location.longitude=location_info.get('longitude')
            requestor_location.latitude=location_info.get('latitude')
            requestor_location.location_country=location_info.get('location_country')
            requestor_location.location_city=location_info.get('location_city')
            requestor_location.comment=location_info.get('comment')
            requestor_location.ip_address=location_info.get('ip_address')
            requestor_location.formatted_address=location_info.get('formatted_address')
            requestor_location.locating_method=location_info.get('locating_method')
            requestor_location.requests_count=1
        else:
            requestor_location.requests_count+=1
        
        requestor_location.put()
        
    
    def get_requestor_from_record_by_ip(self,ip_address):
        
        result=RequestorLocation.all().filter('ip_address =',ip_address).get()
        if result:
            return result
        else:
            return None
        
    def get_geolocation_by_ip_using_api(self,ip_address):
        try:
            api_key='64088fe5c1d02c5e010167137bdb466aef092dd813d2fe68a04605fa841db8fd'
            response=urllib.urlopen('http://api.ipinfodb.com/v3/ip-city/?key=%s&ip=%s&format=json'%(api_key, ip_address))
            response_string=response.read()
            json_obj=json.loads(response_string)
            return json_obj['latitude'], json_obj['longitude']
        except:
            traceback.print_exc()
            return "",""
        
    def get_address_by_latlng(self,latitude,longitude):
        formatted_address=""
        location_country="Unknown"
        location_city="Unknown"
        if latitude!="" and longitude!="":
        
            response=urllib.urlopen('http://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s&sensor=false'%(latitude,longitude))
            response_string=response.read()
            json_obj=json.loads(response_string)
        
            try:
                if json_obj['status']=='OK':
                    address_result=json_obj['results'][0]
                    formatted_address=address_result['formatted_address']
                    address_components=address_result['address_components']
                    for address_component in address_components:
                        if address_component['types'][0]=="country":
                            location_country=address_component['long_name']
                        elif address_component['types'][0]=="locality":
                            location_city=address_component['long_name']
            except:
                traceback.print_exc()
        
        return (location_country, location_city, formatted_address)
                    
            
            
        
        
