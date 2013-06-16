$(document).ready(function(){
    var pageSetup=function(){
        var application_url='/zthought';
        $('#btnrecordtrigger').click(function(){

            resetModal();
            $("#record_info").append("<input type='hidden' name='current_record_key' id='current_record_key' value=''/>");
            $("#record_info").append("<input type='hidden' name='actionType' id='actionType' value='insert'/>");
            showModal();

        });
        
       $('#recorddownmoment').click(function(){
           var description=$.trim($("#description").val()).replace(/\n/g,"<br>");
           var title=$.trim($("#record_title").val()).replace(/\n/g,"<br>");
           $("#ajaximage_save").html("<img src='/images/ajax-loader.gif'/>");
           var record_key=$.trim($("#current_record_key").val());
           var actionType=$.trim($("#actionType").val());
           var send_url=application_url+'?dispatcher=update_records';
           var redirect_url=window.location.href;
           action_on_a_record(actionType,title,description,record_key,send_url,redirect_url);
           

       });
       
       $('li#action_button_delete').click(function(){

           confirmPrompt($(this),"Confirm Record Delete","Are you sure to delete the current record?","Cancel","Confirm",removeCurrentRecord);
        });
        
    
        $('li#action_button_comment').click(function(){
            var currentObj=$(this);
            check_reload_comments(currentObj);


        });


        $('li#action_button_edit').click(function(){
            var current_record_content=$(this).parents('div.record').find('.record_content_body').html();
            var current_record_title=$(this).parents('div.record').find('.record_content_title').html();
            var current_record_key=$(this).parents('div.record').find('#record_key').val();
            $("#record_info").html("");
            $("#record_title").val(current_record_title);
            $("#record_info").append("<input type='hidden' name='current_record_key' id='current_record_key' value='"+current_record_key+"'/>");
            $("#record_info").append("<input type='hidden' name='actionType' id='actionType' value='update'/>");
            $('#description').val($.trim(current_record_content).replace(/<br>/g,"\n"));
            showModal();

        });
   
    
    
        
        var resetModal=function(){
               
               $("#ajaximage").html("");
               $("#record_info").html("");
               $('#description').val("");
               $('#record_title').val("");

           };
           
        var dismissModal=function(){
               $('#recordModal').modal('hide');
           };
               
        var showModal=function(){
            $('#recordModal').modal({
                  backdrop: 'static',
                  keyboard: false       
            }).css({

                  });
            $("#description").css({
                'width': function(){
                    return $('#recordModal').width()*0.9;
                }

            });
        };
        
        var action_on_a_record=function(actionType,title,description,record_key,send_url,redirect_url){
            $.ajax({
                   type:'POST',
                   url:send_url,
                   data: {actionType:actionType,title:title,description:description,record_key:record_key},
                   success: function(json_msg){
                       $("#ajaximage_save").html("");         
                       var jsonobj=$.parseJSON(json_msg);
                       if (jsonobj.status=="ok") window.location.href=redirect_url;
                       if(jsonobj.status=="fail"){
                           alert(jsonobj.message);

                       }
                   },
                   error: function(){
                       alert("Error: Something is wrong while sending the ajax request.");
                       dismissModal();
                   },
                   dataType:'text'
               });
            
        };



        var removeCurrentRecord=function(currentObj){
            var record_key=currentObj.parents('div.record').find('#record_key').val();
            var actionType="delete";
            var description="";
            var title="";
            var send_url=application_url+'?dispatcher=update_records';
            var redirect_url=window.location.href;
            action_on_a_record(actionType,title,description,record_key,send_url,redirect_url);
        };

        var confirmPrompt=function(currentObj,heading, question, cancelButtonTxt, okButtonTxt,callbackfunction) {

            var confirmModal = $('<div class="modal hide fade">' +    
                  '<div class="modal-header">' +
                    '<a class="close" data-dismiss="modal" >&times;</a>' +
                    '<h3>' + heading +'</h3>' +
                  '</div>' +

                  '<div class="modal-body">' +
                    '<p>' + question + '</p>' +
                  '</div>' +

                  '<div class="modal-footer">' +
                    '<a class="btn" id="cancelButton">' + 
                      cancelButtonTxt + 
                    '</a>' +
                    '<a id="okButton" class="btn btn-primary">' + 
                      okButtonTxt + 
                    '</a>' +
                  '</div>' +
                '</div>');

            confirmModal.modal('show');

            confirmModal.find('#cancelButton').click(function(event) {

              confirmModal.modal('hide');

            });
            confirmModal.find('#okButton').click(function(event) {

              confirmModal.modal('hide');
              callbackfunction(currentObj);
            });
          };
          
    

          var check_reload_comments=function(currentObj){
              var current_record_key=currentObj.parents('div.record').find('#record_key').val();
              var send_url=application_url+'?dispatcher=get_comments';
              $.ajax({
                  type:'POST',
                  url:send_url,
                  data:{topic_key:current_record_key},
                  success: function(json_msg){
                      var jsonObj=$.parseJSON(json_msg);
                      if(jsonObj.status=='ok'){

                          prepare_comment_box(currentObj,json_msg);

                      }else if(jsonObj.status=='fail'){
                          alert(jsonObj.message);
                      }

                  },

                  dataType:'text'
              });
          };


      var post_record_comment=function(currentObj,topic_key,comment_content,author){
          if(comment_content=="") return false;
          var sender_url=application_url+'?dispatcher=post_comment';
          $.ajax({
              type:'POST',
              url:sender_url,
              data:{topic_key:topic_key,comment_content:comment_content,author:author},
              success:function(json_msg){
                  var jsonObj=$.parseJSON(json_msg);
                  if(jsonObj.status=="ok") check_reload_comments(currentObj);

              },
              dataType:'text'
          });
      };

    var get_current_username=function(){
        return $.trim($('#user_nickname').html())==""?'anonymous':$('#user_nickname').html();
    };



    var prepare_comment_box=function(currentObj,json_msg){            
        var jsonObj=$.parseJSON(json_msg);

        var comments_count=parseInt(jsonObj.comments_count,10);

        var record_comment_obj=currentObj.parents('div.record').children('.record_comment');
        var record_comment_content=record_comment_obj.find('.record_comment_content');
        var record_comment_input=record_comment_obj.find('.record_comment_input');

        if(comments_count>0){
            var comment_content_list="";
            comment_content_list+="<div class='record_comment_text'>";

            $.each(jsonObj.comments,function(i,comment){
                comment_content_list+="<blockquote>";
                comment_content_list+="<p>"+comment.comment_content+"<br>"+"</p>";
                comment_content_list+="<small>";
                comment_content_list+=comment.author+"@"+comment.created;
                comment_content_list+="</small>";
                comment_content_list+="</blockquote>";

            })

            comment_content_list+="</div>";
            record_comment_content.html(comment_content_list);
        }
        var author=get_current_username();
        var record_comment_input_html="<br><p class='muted'>press Shift+Enter or the <i class='icon-envelope'></i> to send your comment.</p>"+
            "<div class='input-prepend input-append'><span class='add-on' id='comment_author'>"+author+"</span>"+
            "<input type='text' class='record_comment_inputbox'/>"+
            "<span class='add-on' id='comment_action'>"+
            "<i class='icon-envelope' id='record_comment_post'></i>"+
            "<i class='icon-eject' id='record_comment_collapse'></i>"+
            "</span></div>";

        record_comment_input.html(record_comment_input_html);

        record_comment_content.find(".record_comment_text").css({
            'width': function(){
                return $('.container-narrow').width()*0.7;
            },
            'margin': '0 auto',
            'text-align':'left',


        });

        record_comment_input.find(".record_comment_inputbox").css({
            'width': function(){
                return $('.container-narrow').width()*0.8-$('#comment_author').width()-$('#comment_action').width();
            },
            'margin': '0 auto',

        });

        record_comment_input.find(".record_comment_inputbox").focus();


        record_comment_input.find(".record_comment_inputbox").keypress(function(e){
            if(e.shiftKey && e.keyCode==13){
                var topic_key=jsonObj.topic_key;
                var comment_content=record_comment_input.find(".record_comment_inputbox").val();
                var author=get_current_username();
                record_comment_input.find(".record_comment_inputbox").val("");
                post_record_comment(currentObj,topic_key,comment_content,author);
            }
        });

        var reset_comment_box=function(){
            record_comment_content.html("");
            record_comment_input.html("");
        };


        record_comment_obj.find("#record_comment_post").click(function(){
                var topic_key=jsonObj.topic_key;
                var comment_content=record_comment_input.find(".record_comment_inputbox").val();
                var author=get_current_username();
                reset_comment_box();
                post_record_comment(currentObj,topic_key,comment_content,author);
            });
        record_comment_obj.find('#record_comment_collapse').click(function(){
            reset_comment_box();
        });


        };
       
       

        
  
    };
    
    pageSetup();
});
