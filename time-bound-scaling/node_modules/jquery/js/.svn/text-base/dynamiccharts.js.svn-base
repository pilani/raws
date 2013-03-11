/**
 * 
 */
     function showGraph()
      {
    	if($('#qw').val() == null || $('#qw').val() == ""){
    		alert("Please enter query");
    		return;
    	}
    	
    	if($('#combobox').val()=="")
    	{
    		alert(" Please select chart type");
    		return;
    	}   		
        $.blockUI({ message: '<h1><img src="./resources/images/ajax-loader.gif" /> Just a moment...</h1>' }); 	
    	$.getJSON("./services/fetchDataFromRdata?query="+$('#qw').val(),
    	function(data){    		  
    	// alert(data.length);
    		 			
    	if(data == null|| data=="")
		{
			alert(" Unable to fetch data!!!");
			$('#jqChart').empty();
			$.unblockUI();
		}
    	
    	if(data != null){
			 var dataArr = [];
    	    
    	   var isFirstElementKey = false;
    	   
    	   if(data.schema.fields[0].type == "INTEGER" ||data.schema.fields[0].type == "FLOAT" )
    		  isFirstElementKey =true;
    	   else
    		  isFirstElementKey =false;
    	   
    	   for(var i=0;i<data.rows.length;i++){
	     		  console.log(" key : "+data.rows[i].f[0].v+ " value : "+data.rows[i].f[1].v)
	     		  
	     		  if(isFirstElementKey)
	     			 dataArr.push([data.rows[i].f[1].v, parseInt(data.rows[i].f[0].v)]);
	     		  else
	     			 dataArr.push([data.rows[i].f[0].v, parseInt(data.rows[i].f[1].v)]);
    	   }    		     	   

           $(document).ready(function () {
               $('#jqChart').jqChart({
                   title: 'Chart Title',
                   legend: { title: 'Legend' },
                   series: [
                               {
                                   type: $('#combobox').val(),
                                   title: $('#combobox option:selected').text(),
                                   data:dataArr
                               }
                           ]
               });
               
               if($('#combobox').val()=='pie'){
               $('#jqChart').bind('tooltipFormat', function (e, data) {
                   var percentage = data.series.getPercentage(data.value);
                   percentage = data.chart.stringFormat(percentage, '%.2f%%');

                   return '<b>' + data.dataItem[0] + '</b></br>' +
                       data.value + ' (' + percentage + ')';
               });
               }

           });
    	}
  	
    	}
	 ).error(function() {
			alert(" Unable to fetch data!!!");
	    });     	  
    		              
      }