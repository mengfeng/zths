#Zths

##INTRO
用 Python + JQuery + Bootstrap 在 Google App Engine 上做了一个站 
http://zinthedream.appspot.com 

这是一个可以用来记录自己的梦境， 图片生活， 感想的GAE with Python 站-[ZINTHDREAM](http://zinthedream.appspot.com) .   
还可以记录Requestor 的大题位置
在墙外。。。 

分为 

* [ZPics --图片记录生活][zpic] 
* [ZDreams--记录梦境][zdream] 
* [ZThoughts --记录感想][zthought]
* [ZMap —Requestor Location][zmap]

[zpic]: http://zinthedream.appspot.com/zpic
[zdream]: http://zinthedream.appspot.com/zdream
[zthought]: http://zinthedream.appspot.com/zthought
[zmap]:http://zinthedream.appspot.com/zmap



##FUNCTIONALITY

* 支持RSS订阅 
* 支持文件上传
* 支持Pagination
* 支持评论
* 支持用Google User Service 登陆
* 页面比较简洁
* 支持Markdown的语法 写作的时候可以用Markdown
* 用Google Map显示浏览者的大体位置
* 用Google GeoChart显示浏览者的地域分布
##技术细节

* 基于Google AppEngine 和 Python
* 用的是 Webapp2 + Jinja的后台和模版
* jQuery + BootStrap的重度使用 
  所有的站内提交和请求都是 Ajax+JSON 
  大多数的UI的逻辑都是在客户端用 jQuery 完成
* HTML5 的 Geolocation 和 IPInfoDB 去获取浏览者的大致位置
* Google Map API v3 来显示地图
* Googel Chart GeoChart
* Bootstrap Notification
* 支持RPCcall和REST SERVICE  输出JSON格式的数据
* 支持Markdown的语法 写作的时候可以用Markdown 用 Markdown.js 和 to-markdown.js作为转化的工具
  可以用作iPhone 或者Android app 的后台… 
  [zths_iosapp.git](http://github.com/mengfeng/zths_iosapp.git) 是它的iPhone App 前端

* 前后端的框架也抽的差不多了 需要的话可以很方便的搭建一个类似的站

##文件的架构

###重要的Python 文件有：
* libimport.py
* basehandler.py
* config.py
* models.py
* main.py
* zpics.py or zdream.py or zthought.py or zmsg.py or zmap.py 他们是相互独立的

###重要的css
* site.css  宏观的style
* zpics_site.css or zdreams_site.css or .....相互独立

###重要的js
* base.js
* zpics.js or zdreams.js or ....相互独立

###重要的template
* base.html
* zdream.html or zpic.html or ....相互独立
* robots.txt
