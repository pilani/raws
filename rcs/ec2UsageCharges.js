var client  = require('./ec2client');
var async   = require('async');
var ec2misc = require('./ec2Misc');

var ec2     = client.getEC2Client();
var ec2aws  = client.getEC2AwssumClient();

getEC2UsageCharges()

function getEC2UsageCharges(){
	async.waterfall([function(callback){callback(null);},
					 ec2misc.getAllInstances,
					 doSomething1,
					 doSomething2
					 ],
					 function(error, data){
 		if(error)
 			console.log("error : "+error);
 		else{

 		}
	});
}

function doSomething1(instances, callback){
	var temp = instances;
	async.forEach(temp, iterator, function(error){
		if(error)
			console.log("error : "+error);
		else{
			callback(null, temp);
		}
	});
}

function iterator(instance, callback){
	var price = config[instance.instanceType]* windows/linux
	instance.price = price;
	callback(null, instance);
}

function doSomething2(instances, callback){
	var totalPrice = 0;
	for(var i in instances){
		totalPrice = totalPrice + instances[i].price;
	}

	console.log("Total Price : "+totalPrice);
	callback(null);
}








