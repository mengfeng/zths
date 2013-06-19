$(document).ready(function(){
    var init_requestor_map=function(){
        
        var init_map_canvas=function(){
            $("#map_canvas").css({
                'width': function(){
                    return $('.container-narrow').width();
                },
                'height':function(){
                  return $('.container-narrow').width();  
                }
            });
            
        }();

        var mapOptions = {
              center: new google.maps.LatLng(25.0, 103.0),
              zoom: 3,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              streetViewControl: true
            };
        google.maps.visualRefresh=true;
        var map = new google.maps.Map(document.getElementById('map_canvas'),mapOptions);
        
        var load_requestor_locations=function(){
            var dispatcher='get_locations';
            $.ajax({
                type:'POST',
                url:'/location',
                data:{dispatcher:dispatcher},
                dataType:'text',
                success: function(msg){
                    var json_obj=$.parseJSON(msg);
                    if(json_obj.status=='ok'){
                        
                        create_markers(json_obj);
                    }else if(json_obj.status=='fail'){
                        alert(json_obj.message);
                    }
                }
                
            });
            
            var create_markers=function(json_obj){
                if(json_obj.requestor_locations_count>0){
                $("#requestor_count").html("<h5 class=''>My Recent "+json_obj.requestor_locations_count+" Requestors</h5>");
                /*
                var html_string="<table class='table'>"+
                "<caption>Requestor Statistics</caption>"+
                "<thead><tr><th>IP Address</th><th>Country</th><th>City</th><th>Requests Count</th></tr></thead>"+
                "<tbody>";
                */
                $.each(json_obj.requestor_locations,function(i,requestor_location){
                    var marker = new google.maps.Marker({
                          position: new google.maps.LatLng(Number(requestor_location.latitude), Number(requestor_location.longitude)),
                          map: map,
                          animation:google.maps.Animation.DROP,
                          title: "Country: "+requestor_location.location_country + 
                          "\nCity: "+requestor_location.location_city+
                          "\nAddress: "+requestor_location.formatted_address+
                          "\nBrowser Type: "+requestor_location.browser_type
                          


                      });
                      
                 /*   html_string+="<tr>"+
                    "<td>"+requestor_location.ip_address+"</td>"+
                    "<td>"+requestor_location.location_country+"</td>"+
                    "<td>"+requestor_location.location_city+"</td>"+
                    "<td>"+requestor_location.requests_count+"</td>"+
                    "</tr>";
                */
                });
             
             /*
             html_string+="</tbody></table>";
             $("#requestors").html(html_string);
             */
            }
        }
        }();
        

    }();
    var init_request_stats=function(){
        var init_stats_map_canvas=function(){
            $("#stats_map,#sg_stats_map").css({
                'width': function(){
                    return $('.container-narrow').width();
                },
                'height':function(){
                  return $('.container-narrow').width();  
                }
            });
            
        }();

        var init_stats_map=function(){
            google.setOnLoadCallback(load_request_stats);
            
            function load_request_stats(){
            
                var dispatcher='get_request_stats';
                $.ajax({
                    type:'POST',
                    url:'/location',
                    data:{dispatcher:dispatcher},
                    dataType:'text',
                    success: function(msg){
                        var json_obj=$.parseJSON(msg);
                        if(json_obj.status=='ok'){
                             var data_array=new Array();
                             data_array=get_data_array_from_json(json_obj);
                             drawRegionMap(data_array);
                        }else if(json_obj.status=='fail'){
                            alert(json_obj.message);
                        }
                    }
                    
                });

                var get_data_array_from_json=function(json_obj){
                    var data_array=new Array();
                    data_array.push(['Country','Request Count']);
                    $.map(json_obj.request_stats,function(val,key){data_array.push([key,val]);});

                    /*$.each(json_obj.request_stats,function(i,request_stats){
                         data_array.push(request_stats);

                        
                    });
                    */

                    //console.log(data_array);
                    return data_array;
                }
                
            
            
            
            }
        
            function drawRegionMap(data_array){
                $("#requestor_stats").html("<h5 class=''>Requestors Regional Stats</h5>");

               var data=google.visualization.arrayToDataTable(data_array);
                var options={
                    colorAxis:{colors:['green','red']},
                    magnifyingGlass:{enable: true,zoomFactor:100},
                    displayMode: 'regions',
                    region: 'world'
                };
                var chart=new google.visualization.GeoChart(document.getElementById('stats_map'));
                chart.draw(data,options);

                /*Draw the request stats for Singapore*/

                $("#sg_requestor_stats").html("<h5 class=''>Most Popular Region</h5>");
                data=google.visualization.arrayToDataTable(data_array);
                options={
                    colorAxis:{colors:['green','red']},
                    magnifyingGlass:{enable: true,zoomFactor:100},
                    displayMode: 'regions',
                    region: 'SG'
                };
                chart=new google.visualization.GeoChart(document.getElementById('sg_stats_map'));
                chart.draw(data,options);



            };
    
        }();


        
    }();

});




