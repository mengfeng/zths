var init_base_section=function(){
    $('#link_home').tooltip({
        title:'Home',
        placement:'bottom',
    });
    /*$('#link_zpic').tooltip({
        title:'Z Pics',
        placement:'bottom',
    });
    */
    /*
    $('#link_zdream').tooltip({
        title:'Z Dreams',
        placement:'bottom',
    });
    $('#link_zmsg').tooltip({
        title:'Leave Z A Message',
        placement:'bottom',
    });
    $('#link_zthought').tooltip({
        title:'Z Thoughts',
        placement:'bottom',
    });
    */
    $('#link_zmap').tooltip({
        title:'Requestor Maps',
        placement:'bottom',
    });

    /*Prepare for the Contact US action*/
    $('#link_contact').tooltip({
        title:'Contact US',
        placement:'bottom',
    });
    $('#link_contact').popover({
        title:'Contact Z',
        placement:'bottom',
        html: true,
        content: function(){
            
           var popover_content='<div id="contactModal" >' +
              '<form id="frmcontact" action="" accept-charset="utf-8">' + 
                 '<div class="input-prepend">'  +
                    '<span class="add-on">From</span>' +
                    '<input type="text" id="contactFrom" disabled value="Zpics@zinthedream.appspotmail.com"></input>' +
                '</div>' +  
                '<div class="input-prepend">  ' +
                    '<span class="add-on">Subject</span>  '+ 
                    '<input type="text" id="contactSubject" value="From Zpics:"></input>  '+
                '</div>  ' +
                '<div>' +  
                   ' <textarea name="contactMessage" id="contactMessage"></textarea>  ' +
                '</div>' +
                '<div class="formbuttons">' +
                    '<button class="btn btn-small" id="btnCloseContact" type="button" onclick="$(&quot;#link_contact&quot;).popover(&quot;hide&quot;);">Close</button>  ' +
                    '<button class="btn btn-primary btn-small" id="btnSend" type="button" onclick="sendContactEmail();">Send</button> '+
                '</div>'+   
            '</form>'+  
        '</div>';
    
        //console.log(popover_content);
           return popover_content;
        },
    });

    
    /*
    $('#link_contact').click(function(e){
        var showModal=function(){
           //console.log("onClick Function happens before the href");
            $('#contactModal').modal({
                  backdrop: 'static',
                  keyboard: false       
            }).css({

                  });
           
           });

        }();



    });
    */
    /*
    $('#link_rss').tooltip({
        title:'RSS Subscription',
        placement:'bottom',
    });
    */
    $('#link_login').tooltip({
        title:'Login/out',
        placement:'bottom',
    });
}();

var sendContactEmail=function(){
    var message=$("#contactMessage").val();
    var subject=$("#contactSubject").val();
    var from=$("#contactFrom").val();
    //console.log("sending email.....\n"+"from: "+from+"\nsubject: "+subject+"\nmessage: "+message);
    if(message=="") return false;
          var sender_url="/zpic"+'?dispatcher=send_email';
          $.ajax({
              method:'post',
              url:sender_url,
              data:{message:message,subject:subject,from:from},
              success:function(json_msg){
                  var jsonObj=$.parseJSON(json_msg);
                  if(jsonObj.status=="ok"){
                        $("#notification").notify({
                            message : {text: jsonObj.message},

                        }).show();

                  }
                  if(jsonObj.status!="ok"){
                        $("#notification").notify({
                            message : {text: jsonObj.message},

                        }).show();


                  } 

              },
              dataType:'text'
          });
 
    $("#link_contact").popover("hide");

}
var get_geolocation=function(){
        
    var browser_type=navigator.userAgent;
    var latitude="";
    var longitude="";
    
    var get_geolocation_by_html5=function(){
        
            var process_position_callback=function(){

                var dispatcher="get_by_html5";
                var locating_method="HTML5";
                var comment="";
                $.ajax({
                    type: 'POST',
                    url: '/location',
                    data: {dispatcher:dispatcher,browser_type:browser_type,latitude:latitude,longitude:longitude,locating_method:locating_method,comment:comment},
                    dataType: 'text',
                    success:function(msg){

                    }
                });
            };

            var process_position_error_callback=function(comment){
                get_geolocation_by_ip(comment);
            }

            var process_position=function(position){
                    latitude=""+position.coords.latitude;
                    longitude=""+position.coords.longitude;
                    process_position_callback();
                };

            var process_error=function(error){
                    switch(error.code) 
                        {
                        case error.PERMISSION_DENIED:
                          comment="User denied the request for Geolocation."
                          break;
                        case error.POSITION_UNAVAILABLE:
                          comment="Location information is unavailable."
                          break;
                        case error.TIMEOUT:
                          comment="The request to get user location timed out."
                          break;
                        case error.UNKNOWN_ERROR:
                          comment="An unknown error occurred."
                          break;
                        }
                    process_position_error_callback(comment);
            };

            navigator.geolocation.getCurrentPosition(process_position,process_error);
    }
    
    var get_geolocation_by_ip=function(comment){
        var dispatcher="get_by_ip";
        var locating_method="IP API";
        $.ajax({
            type: 'POST',
            url: '/location',
            data: {dispatcher:dispatcher,browser_type:browser_type,comment:comment,locating_method:locating_method},
            dataType: 'text',
            success:function(msg){

            }
        });
    }
    
    
    if(navigator.geolocation){
        get_geolocation_by_html5();
    }else{
        comment="html5 is not supported";
        get_geolocation_by_ip(comment);
    }
    
    
}();

