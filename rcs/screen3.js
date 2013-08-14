var client     = require('./ec2client');
var async      = require('async');
var ec2misc    = require('./ec2Misc');
var cloudwatch = require('./cloudWatchMetricStatistics.js');

var ec2     = client.getEC2Client();
var ec2aws  = client.getEC2AwssumClient();

/*getApplicationDetails();*/

exports.screen3 = function(req, res){
	getApplicationDetails(function(response){
		res.send(response);
		res.end();
	});
}

function getApplicationDetails(callback){
	async.waterfall([function(callback){callback(null);},
					getApps,
					getInstances,
					printInstances,
					getAppDetails
					],
					function(error, data){
						if(error)
							console.log("Error : "+error);
					else{
						console.log(data);
						console.log("complete");
						callback(JSON.stringify(data));
					}
	});
}

function getApps(callback){
	ec2misc.getSecurityGroups(callback);
}

function getInstances(securityGroups, callback){
	async.forEach(securityGroups, instanceIterator, function(error){
		if(error)
			console.log("Error : "+error);
		else{
			callback(null, securityGroups);
		}
	});
}

function instanceIterator(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);}, 
					getApplicationInstances
					],
					function(error, data){
 						if(error)
 							console.log("Error : "+error);
 						else{
 							securityGroup.instances = data;
 							callback(null, securityGroup);
 						}
 					}
	);
}

function getApplicationInstances(securityGroup, callback){
	ec2misc.getInstances(securityGroup.name, callback);
}

function printInstances(securityGroups, callback){
	callback(null, securityGroups);
}

function getAppDetails(securityGroups, callback){
	async.forEach(securityGroups, iterator, function(error){
		if(error)
			console.log("Error : "+error);
		else{
			callback(null, securityGroups);
		}
	});
}

function iterator(securityGroup, callback){
	async.parallel([
		function(callback){
			getAppInstanceCount(securityGroup, callback);
		},
		function(callback){
			getAppZoneCount(securityGroup, callback);
		},
		function(callback){
			getAppPlatform(securityGroup, callback);
		},
		function(callback){
			getAppInstanceType(securityGroup, callback);
		},
		function(callback){
			getCpuUtilization(securityGroup, callback);
		},
		function(callback){
			getMemoryUtilization(securityGroup, callback);
		},
		function(callback){
			getNetworkUtilization(securityGroup, callback);
		}
		],
		function(error, data){
			if(error)
				console.log("Error : "+error);
			else{
				callback(null, securityGroup);
			}
	});
}

function getAppInstanceCount(securityGroup, callback){
	securityGroup.instanceCount = securityGroup.instances.length.toString();
	callback(null, securityGroup);
}

function getAppZoneCount(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getZoneCount
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			securityGroup.zoneA = data.zoneA.toString();
 			securityGroup.zoneB = data.zoneB.toString();
 			callback(null, securityGroup);
 		}
	});
}

function getZoneCount(securityGroup, callback){
	ec2misc.getZone(securityGroup.instances, callback)
}

function getAppPlatform(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getPlatform
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			securityGroup.platform = data;
 			callback(null, securityGroup);
 		}
	});
}

function getPlatform(securityGroup, callback){
	ec2misc.getApplicationPlatform(securityGroup.instances, callback);
}

function getAppInstanceType(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getInstanceType
					 ],
					 function(error, data){
    	if(error)
    		console.log("Error : "+error);
    	else{
    		securityGroup.instanceType = data;
    		callback(null, securityGroup);
    	}
	});
}

function getInstanceType(securityGroup, callback){
	ec2misc.getApplicationInstanceType(securityGroup.instances, callback);
}

function getCpuUtilization(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getCpu
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			if(securityGroup.instances.length == 0)
 				securityGroup.cpu = 0;
 			else
 				securityGroup.cpu = data;

 			callback(null, securityGroup);
 		}
	});
}

function getMemoryUtilization(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getMemory
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			if(securityGroup.instances.length == 0)
 				securityGroup.memory = 0;
 			else
 				securityGroup.memory = data;

 			callback(null, securityGroup);
 		}
	});	
}

function getNetworkUtilization(securityGroup, callback){
	async.waterfall([function(callback){callback(null, securityGroup);},
					 getNetwork
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error : "+error);
 		else{
 			
 			if(securityGroup.instances.length == 0)
 				securityGroup.network = 0;
 			else
 				securityGroup.network = data;

 			callback(null, securityGroup);
 		}
	});
}

function getCpu(securityGroup, callback){
	cloudwatch.getCpuUtilization(securityGroup.instances, callback);
}

function getMemory(securityGroup, callback){
	cloudwatch.getMemoryUtilization(securityGroup.instances, callback);
}

function getNetwork(securityGroup, callback){
	cloudwatch.getNetworkUtilization(securityGroup.instances, callback);
}



