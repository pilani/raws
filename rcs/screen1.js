var client     = require('./ec2client');
var async      = require('async');
var ec2misc    = require('./ec2Misc');
var cloudwatch = require('./cloudWatchMetricStatistics.js');

var ec2     = client.getEC2Client();
var ec2aws  = client.getEC2AwssumClient();

/*getEC2CloudwatchStatistics();*/

exports.screen1 = function(req, res){
	getEC2CloudwatchStatistics(function(response){
		res.send(response);
		res.end();
	});
}

function getEC2CloudwatchStatistics(callback){
	console.log(new Date());
	async.waterfall([function(callback){callback(null);},
					 ec2misc.getAllInstances,
					 getStatistics,
					 getAverageStatistics
					 ],
					 function(error, data){
   		if(error)
   			console.log("error : "+error);
   		else{
   			console.log(data);
   			console.log(new Date());
   			console.log("complete");
   			callback(JSON.stringify(data));
   		}
	});
}

function getStatistics(instances, callback){
	async.forEach(instances, iterator, function(error){
		if(error)
			console.log("error : "+error);
		else{
			callback(null, instances);
		}
	});
}

function getAverageStatistics(instances, callback){
	var cpu     = 0;
	var memory  = 0;
	var network = 0;

	for(var i in instances){
		cpu     = cpu     + instances[i].cpu;
		memory  = memory  + instances[i].memory;
		network = network + instances[i].network;
	}

	var object = new Object();

	object.cpu     = cpu/instances.length;
	object.memory  = memory/instances.length;
	object.network = network/instances.length;

	callback(null, object);
}

function iterator(instance, callback){
	async.parallel([
			function(callback){
				getCpuUtilization(instance, callback);
			},
			function(callback){
				getMemoryUtilization(instance, callback);
			},
			function(callback){
				getNetworkUtilization(instance, callback);
			}],
			function(error, data){
				if(error)
					console.log("error : "+error);
				else
					callback(null);
			
	});
}

function getCpuUtilization(instance, callback){
	var instances = createInstanceArray(instance);
	async.waterfall([function(callback){callback(null, instances);},
					 getCpu
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			instance.cpu = data;
 			callback(null, instance);
 		}
	});
}

function getMemoryUtilization(instance, callback){
	var instances = createInstanceArray(instance);
	async.waterfall([function(callback){callback(null, instances);},
					 getMemory
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			instance.memory = data;
 			callback(null, instance);
 		}
	});	
}

function getNetworkUtilization(instance, callback){
	var instances = createInstanceArray(instance);
	async.waterfall([function(callback){callback(null, instances);},
					 getNetwork
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			instance.network = data;
 			callback(null, instance);
 		}
	});
}

function getCpu(instances, callback){
	cloudwatch.getCpuUtilization(instances, callback);
}

function getMemory(instances, callback){
	cloudwatch.getMemoryUtilization(instances, callback);
}

function getNetwork(instances, callback){
	cloudwatch.getNetworkUtilization(instances, callback);
}

function createInstanceArray(instance){
	var array = new Array();
	array.push(instance);

	return array;
}




