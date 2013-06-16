from zdream import *
from zpic import *
from zmsg import *
from zthought import *
from zmap import *
from basehandler import *

app=webapp2.WSGIApplication(
[   ('/',ZPic),
    ('/zdream',ZDream),
    ('/zpic',ZPic),
    ('/zmsg',ZMSG),
    ('/zthought',ZThought),
    ('/zmap',ZMAP),
    ('/rss',RSS),
    ('/rpc',RPC),
    ('/location',Location),
    ('/upload',RecordFileUpload),
    ('/robots.txt',Robot),
],
    
    debug=True
    )