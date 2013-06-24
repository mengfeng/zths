$(document).ready(function(){
 var init_record_modal=function(){
    $('#btnrecordtrigger').click(function(){

        resetModal();

        showModal();

    });
    
   $('#recorddownmoment').click(function(){
       //var description=$.trim($("#description").val()).replace(/\n/g,"<br>");
       var description=markdowntohtml($.trim($("#description").val()));
       $("#ajaximage_save").html("<img src='/images/ajax-loader.gif'/>");
       var record_key=$.trim($("#current_record_key").val());
       var actionType=$.trim($("#actionType").val());
       var send_url=application_url+'?dispatcher=update_records';
       var redirect_url=window.location.href;
       action_on_a_record(actionType,description,record_key,send_url,redirect_url);
       

   });

    $("#btnupload").click(function() {
       $("#ajaximage").html("<img src='/images/ajax-loader.gif'/>");

       var iframe = '<iframe name="postiframe" id="postiframe" style="display:none" />';

       $("#fileuploadiframe").html(iframe);

       var form = $('#frmrecord');

       form.attr("target", "postiframe");

       form.submit();

       $("#postiframe").load(function() {
           var iframeContent = $("#postiframe")[0].contentWindow.document.body.innerText;
           var jsonobj=$.parseJSON(iframeContent);
           if (jsonobj.status=='ok'){
               current_record_key=jsonobj.new_record_key;
               iframeContent="<img src='"+jsonobj.image_url+"'/>";
               $("#record_info").html("");
               $("#record_info").append("<input type='hidden' name='current_record_key' id='current_record_key' value='"+current_record_key+"'/>");
               $("#record_info").append("<input type='hidden' name='actionType' id='actionType' value='update'/>");
               $('#recorddownmoment').attr('disabled',false);
           }



            else if(jsonobj.status=='fail') iframeContent="Failed to upload the file.."+jsonobj.message;
            $("#fileuploadiframe").html(iframeContent);
            $("#ajaximage").html("");

            $("#btnupload").attr("disabled",true);
       });




       });
};
var init_action_buttons=function(html_obj){
   //console.log("re-initializing the action button for newly loaded elements..");
   var $selector=$(html_obj);
   $('i#action_button_delete',$selector).click(function(){

       confirmPrompt($(this),"Confirm Record Delete","Are you sure to delete the current record?","Cancel","Confirm",removeCurrentRecord);
    });
    

    $('i#action_button_comment',$selector).click(function(){
        var currentObj=$(this);
        check_reload_comments(currentObj);


    });


    $('i#action_button_edit',$selector).click(function(){
        var current_record_content=$(this).parents('div.record').find('.record_content_body').html();
        var current_record_key=$(this).parents('div.record').find('#record_key').val();
        var current_record_image_url=$(this).parents('div.record').children('.record_image').html();
        $("#fileuploadiframe").html(current_record_image_url);
        $("#btnupload").attr("disabled",true);
        $("#record_info").html("");
        $("#record_info").append("<input type='hidden' name='current_record_key' id='current_record_key' value='"+current_record_key+"'/>");
        $("#record_info").append("<input type='hidden' name='actionType' id='actionType' value='update'/>");
        //$('#description').val($.trim(current_record_content).replace(/<br>/g,"\n"));
        //console.log(current_record_content);
        $('#description').val(htmltomarkdown(current_record_content));
        showModal();

    });
/*
   $(".record_image img").click(function(){
        var $current_image=$(this);
        init_records_slideshow($current_image);
   });

*/
}; 
    
var resetModal=function(){
    $("#fileuploadiframe").html("");
    $("#ajaximage").html("");
    $("#btnupload").attr("disabled",false);
    $('#description').val("");
    $('#record_file').val("");
    $('#recorddownmoment').attr('disabled',true);
    $("#record_info").html("");

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

var action_on_a_record=function(actionType,description,record_key,send_url,redirect_url){
    
    $.ajax({
           type:'POST',
           url:send_url,
           data: {actionType:actionType,description:description,record_key:record_key},
           success: function(json_msg){
               $("#ajaximage_save").html("");         
               var jsonobj=$.parseJSON(json_msg);
               if (jsonobj.status=="ok") window.location.href=redirect_url;
               if(jsonobj.status=="fail"){
                   alert(jsonobj.message);

               }
           },
           error: function(){
               alert("Error: Something is wrong while sending the ajax request");
               dismissModal();
           },
           dataType:'text'
       });
    
};



var removeCurrentRecord=function(currentObj){
    var record_key=currentObj.parents('div.record').find('#record_key').val();
    var actionType="delete";
    var description="";
    var send_url=application_url+'?dispatcher=update_records';
    var redirect_url=window.location.href;
    action_on_a_record(actionType,description,record_key,send_url,redirect_url);
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
      method:'post',
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
            return $(".record").width();
        },
        'margin': '0 auto',
        'text-align':'left'


    });

    record_comment_input.find(".record_comment_inputbox").css({
        'width': function(){
            return $('.record').width()*0.8-$('#comment_author').width()-$('#comment_action').width();
        },
        'margin': '0 auto'

    });

    //reload the grid
    load_masonry_layout();

    record_comment_input.find(".record_comment_inputbox").focus();


    record_comment_input.find(".record_comment_inputbox").keypress(function(e){
        if(e.shiftKey && e.keyCode==13){
            var topic_key=jsonObj.topic_key;
            var comment_content=record_comment_input.find(".record_comment_inputbox").val();
            var author=get_current_username();
            record_comment_input.find(".record_comment_inputbox").val("");
            post_record_comment(currentObj,topic_key,comment_content,author);
        }
        //reload the grid
        load_masonry_layout();
    });

    var reset_comment_box=function(){
        record_comment_content.html("");
        record_comment_input.html("");
        //reload the grid 
        load_masonry_layout();
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
       
var back_to_top_init=function(){
    var pxShow=500;
    var fadeInTime=1000;
    var fadeOutTime=1000;
    var scrollSpeed=1000;
    var $backtotop=$("#backtotop");
    $(window).scroll(function(){
        if($(window).scrollTop() >=pxShow){
            $backtotop.fadeIn(fadeInTime);
        }else{
            $backtotop.fadeOut(fadeOutTime);
        }
    
    });

    $backtotop.click(function(){
        $('html, body').animate({
            scrollTop: 0
        },
            scrollSpeed
        );
        return false;
    });

};

var init_page_layout=function(){
   var min_masonry_width=900;
   var set_maonry_values=function(){
       if($(window).width()<min_masonry_width){
            load_masonry_layout(480,520);
       }else{
            load_masonry_layout(410,900);
       }
   };
   set_maonry_values();
  /* $(window).resize(function(){
        set_maonry_values();
   });
  */
};        
var load_masonry_layout=function(record_width,container_width){
   var $container=$('.records');
   $(".record").css({'width':record_width});
   $(".container-narrow").css({'max-width':container_width});


   $container.imagesLoaded(function(){
       $container.masonry({
            itemSelector : '.record'
       });
   });

   //console.log("masonry completed...");
   
    $container.infinitescroll({
        navSelector : '#pager',
        nextSelector : '#pager a:last',
        itemSelector : '.record',
        loading: {
            img: 'http://i.imgur.com/6RMhx.gif',
            msgText: 'loading... ...',
            finishedMsg: 'loading completed'
        },
        animate: true,
        extraScrollPx: 0,
        bufferPx: 0
    
    },
    //trigger masonry as a callback
    function( newElements){
        var $newElems=$(newElements).css({opacity:0});
        $newElems.imagesLoaded(function(){
            $newElems.animate({opacity:1});
            $container.masonry('appended',$newElems);
        });
        init_action_buttons(newElements); 
    });
    
 };
var unload_masonry_layout=function(){
    $container=$('.records');
    var msnry=$container.data('masonry');
    if(msnry !=null) msnry.destroy();
    //$container.masonry('destroy');
    $container.infinitescroll('destroy');
    
    $(".record").css({'width':480});
    $(".container-narrow").css({'max-width':520});

}
var init_records_slideshow=function(current_image){
   unload_masonry_layout();
    //deregister the image unclick event:
    $(".record_image img").unbind();
    //addClass for the items to be displayed
    $(".records").addClass("carousel slide");
    //decrorating the items
    $(".record").wrapAll("<div class='carousel-inner'/>");
    $(".record").addClass("item");

    //formatting the indicators:
    /*$(".carousel-inner").before("<ol class='carousel-indicators'></ol>");
    $.each($(".record"),function(index,value){
        //$("ol.carousel-indicators").html("");
        $("ol.carousel-indicators").append("<li data-target='.records' data-slide-to='"+index+"'></li>");
    });
    */

    $(".records").carousel();


};
        
  

var htmltomarkdown=function(html){
    //toMarkdown is defined in to-mardown.js
    //console.log(html);
    return toMarkdown(html);
};

var markdowntohtml=function(text){
    //markdown is defined in markdown.js
    //console.log(text);
    var html=markdown.toHTML(text);
    //console.log(html);
    return html;
};

var application_url='/zpic';
init_base_section(); //function is defined in base.js
init_record_modal();
init_action_buttons($(document)); 
//load_masonry_layout(410,900);
init_page_layout();
back_to_top_init();

get_geolocation(); //function is defined in base,js


});
