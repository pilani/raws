var client = require('./ec2client.js');
var async  = require('async');

var ec2    = client.getEC2Client();
var ec2aws = client.getEC2AwssumClient();

exports.getSecurityGroups = function getSecurityGroups(callback){
	var securityGroups = new Array();
	ec2.client.describeSecurityGroups(function(error, data){
		if(error)
			console.log("Error fetching security groups : "+error);
		else{
			for(var i in data.SecurityGroups){
				var securityGroup  = new Object();
				securityGroup.name = data.SecurityGroups[i].GroupName;

				securityGroups.push(securityGroup);
			}
		}
		callback(null, securityGroups);
	});
}

exports.getAllInstances = function getAllInstances(callback){
	var instances = new Array();

	ec2.client.describeInstances(function (error, data){
		if(error)
			console.log("Error fetching instances : "+error.message);
		else{
			for(var i in data.Reservations){
				for(var j in data.Reservations[i].Instances){
					if(data.Reservations[i].Instances[j].State.Name == "running"){
						
						var instance      = new Object();
						instance.id       = data.Reservations[i].Instances[j].InstanceId;
						instance.state    = data.Reservations[i].Instances[j].State.Name;
						instance.type     = data.Reservations[i].Instances[j].InstanceType;
						instance.zone     = data.Reservations[i].Instances[j].Placement.AvailabilityZone;
						instance.platform = data.Reservations[i].Instances[j].Platform;

						instances.push(instance);
					}
				}
			}
		}
		
		callback(null, instances);
	});
}

exports.getInstances = function getInstances(securityGroup, callback){
	var instances = new Array();
	ec2.client.describeInstances(function (error, data){
		if(error)
			console.log("Error fetching instances : "+error);
		else{
			var instances = new Array();
			for(var i in data.Reservations){
				for(var j in data.Reservations[i].Instances){
					if(data.Reservations[i].Instances[j].SecurityGroups[0].GroupName == securityGroup &&
					   data.Reservations[i].Instances[j].State.Name == "running"){	
						
						var instance      = new Object();
						instance.id       = data.Reservations[i].Instances[j].InstanceId;
						instance.state    = data.Reservations[i].Instances[j].State.Name;
						instance.type     = data.Reservations[i].Instances[j].InstanceType;
						instance.zone     = data.Reservations[i].Instances[j].Placement.AvailabilityZone;
						instance.platform = data.Reservations[i].Instances[j].Platform;

						instances.push(instance);
					}
				}
			}
		}
		
		callback(null, instances);
	});
}

exports.getApplicationInstanceType = function getApplicationInstanceType(instances, callback){
	async.waterfall([function(callback){callback(null, instances);}, 
					getAllInstanceTypes,
					removeDuplicates, 
					getValue], 
					function(error, data){
		if(error)
			console.log("Error : "+error);
		else{
			callback(null, data);
		}
	});
}

exports.getApplicationPlatform = function getApplicationPlatform(instances, callback){
	async.waterfall([function cb(callback){callback(null, instances);}, 
					getAllPlatforms,
					removeDuplicates,
					getValue],
					function(error, data){
		
		if(error)
			console.log("Error : "+error);
		else{
			callback(null, data);
		}
	});
}

exports.getZone = function getZone(instances, callback){
	async.waterfall([function cb(callback){callback(null, instances);}, 
					zoneIterator
					],
					function(error, data){
		
		if(error)
			console.log("Error : "+error);
		else{
			callback(null, data);
		}
	});
}

function getAllInstanceTypes(instances, callback){
	var instanceTypes = new Array();
		
	for(var i in instances){
		/*console.log(instances[i].type);*/
		instanceTypes.push(instances[i].type);
	}

	callback(null, instanceTypes);
}

function getAllPlatforms(instances, callback){
	var platforms = new Array();
	for(var i in instances){
		if(instances[i].platform == null || instances[i].platform == "" || 
											instances[i].platform == "undefined")
			platforms.push("linux");
		else
			platforms.push(instances[i].platform);
	}

	callback(null, platforms)
}

function zoneIterator(instances, callback){
	var zone = new Object();
	
	zone.zoneA = 0;
	zone.zoneB = 0;
	
	for(var i in instances){
		if(instances[i].zone == "ap-southeast-1a")
			zone.zoneA++;
		else
			zone.zoneB++;
	}
	
	callback(null, zone);	
}

function removeDuplicates(temp, callback){
	var unique = temp.filter(function(element, position){
		return temp.indexOf(element) == position;
	});
	
	callback(null, unique);
}

function getValue(unique, callback){
	var value = "";
	for(var i in unique){
		value = value + unique[i]+" ";
	}

	callback(null, value);
}













