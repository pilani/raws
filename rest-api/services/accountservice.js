var accountvo = require('../vo/accountdetailsvo.js');
var accountlist = require('../vo/accountdetailsvo.js');
var serviceslist = require('../vo/servicesvo.js');
var servicedetailsvo = require('../vo/servicedetailsvo.js');
var servicedisplaymapvo = require('../vo/servicedisplaymapvo.js');

exports.getaccounts = function(req,res) {
	 
	var acDetailsArray = new Array(); 

	for (var i = 1; i < 5; i++) {
		
		var acDetails = new accountvo();
		
		acDetails.id = i;
		acDetails.name = "redBus - "+i;
		acDetails.usagecharges ="$233"+i;
		acDetails.avgcpu = "50%";
		acDetails.avgmemorey ="20%";
		acDetails.avgnetwork = "10%";

        acDetailsArray.push(acDetails);
	}

	var list = new accountlist();
	list.accountdetailsvo = acDetailsArray;

  var jsonString = JSON.stringify(list);
  res.send(jsonString);
  res.end();
}


exports.getservicesbyaccount = function(req,res) {
	
	var servicesArray = new Array(); 
	var accountId =req.query["id"];
	for (var i = 1; i < 7; i++) {
		
		var serviceDetails = new servicedetailsvo();
		if(accountId == 1){
			if(i==1){
				serviceDetails.id = i;
				serviceDetails.name = "EC2"
				serviceDetails.imagename ="ec2.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$12R";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);
			}
			else if(i==2){
				serviceDetails.id = i;
				serviceDetails.name = "CS3"
				serviceDetails.imagename ="cs3.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$11R";
					}
					else
					{
						servicedisplaymap.name ="No of Busckets";						
						servicedisplaymap.value = "99";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i == 3){
serviceDetails.id = i;
				serviceDetails.name = "DNS"
				serviceDetails.imagename =" DNS.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$10R";
					}
					else
					{
						servicedisplaymap.name ="No of hosted zone";						
						servicedisplaymap.value = "98";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i == 4){
serviceDetails.id = i;
				serviceDetails.name = "CES"
				serviceDetails.imagename ="ces.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$12R";
					}
					else
					{
						servicedisplaymap.name ="No of emails sent";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
			else if(i== 5){
serviceDetails.id = i;
				serviceDetails.name = "CACHE"
				serviceDetails.imagename =" cache.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$12R";
					}
					else
					{
						servicedisplaymap.name ="Running Clusters";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}else if(i==6){
				serviceDetails.id = i;
				serviceDetails.name = "DB"
				serviceDetails.imagename ="DB.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$124R";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
		}
		else if(accountId == 2){
			if(i==1){
				serviceDetails.id = i;
				serviceDetails.name = "EC2"
				serviceDetails.imagename ="ec2.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$121SS";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
			else if(i==2){
				serviceDetails.id = i;
				serviceDetails.name = "CS3"
				serviceDetails.imagename ="cs3.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$11SS";
					}
					else
					{
						servicedisplaymap.name ="No of Busckets";						
						servicedisplaymap.value = "99";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
			else if(i == 3){
serviceDetails.id = i;
				serviceDetails.name = "DNS"
				serviceDetails.imagename =" DNS.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$10SS";
					}
					else
					{
						servicedisplaymap.name ="No of hosted zone";						
						servicedisplaymap.value = "98";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i == 4){
serviceDetails.id = i;
				serviceDetails.name = "CES"
				serviceDetails.imagename ="ces.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$12SS";
					}
					else
					{
						servicedisplaymap.name ="No of emails sent";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i== 5){
serviceDetails.id = i;
				serviceDetails.name = "CACHE"
				serviceDetails.imagename =" cache.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$123SS";
					}
					else
					{
						servicedisplaymap.name ="Running Clusters";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}else if(i==6){
				serviceDetails.id = i;
				serviceDetails.name = "DB"
				serviceDetails.imagename ="DB.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$127SS";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
		}
		else if(accountId == 3){
		
						if(i==1){
				serviceDetails.id = i;
				serviceDetails.name = "EC2"
				serviceDetails.imagename ="ec2.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$121PLT";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
			else if(i==2){
				serviceDetails.id = i;
				serviceDetails.name = "CS3"
				serviceDetails.imagename ="cs3.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$11PLT";
					}
					else
					{
						servicedisplaymap.name ="No of Busckets";						
						servicedisplaymap.value = "99";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
			else if(i == 3){
serviceDetails.id = i;
				serviceDetails.name = "DNS"
				serviceDetails.imagename =" DNS.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$10PLT";
					}
					else
					{
						servicedisplaymap.name ="No of hosted zone";						
						servicedisplaymap.value = "98";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i == 4){
serviceDetails.id = i;
				serviceDetails.name = "CES"
				serviceDetails.imagename ="ces.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$12PLT";
					}
					else
					{
						servicedisplaymap.name ="No of emails sent";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
servicesArray.push(serviceDetails);
			}
			else if(i== 5){
serviceDetails.id = i;
				serviceDetails.name = "CACHE"
				serviceDetails.imagename =" cache.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$123PLT";
					}
					else
					{
						servicedisplaymap.name ="Running Clusters";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}else if(i==6){
				serviceDetails.id = i;
				serviceDetails.name = "DB"
				serviceDetails.imagename ="DB.jpeg";
				var contentArray = new Array(); 
				for(var k =0;k<2;k++){
						var servicedisplaymap = new servicedisplaymapvo();
						if(k == 1){
						servicedisplaymap.name = "usage Charges";
						servicedisplaymap.value = "$127PLT";
					}
					else
					{
						servicedisplaymap.name ="Running Instances";						
						servicedisplaymap.value = "100";
					}
					contentArray.push(servicedisplaymap);
				}
				serviceDetails.servicedisplaymap = contentArray;
				servicesArray.push(serviceDetails);

			}
		}
	}

	var list = new serviceslist();
	list.servicedetailsvo = servicesArray;

  var jsonString = JSON.stringify(list);
  res.send(jsonString);
  res.end();
}