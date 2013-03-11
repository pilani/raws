var aws = require('./rbEC2Client.js');
var ec2 = aws.getEC2Client();

var policyTable = require('./TimeBoundScalingPolicyTable.js');

var logger = require('./logger.js').logger;

var async = require('async');

var policyList = new Array();

var TimeBoundScalingPolicy = policyTable.getTimeBoundScalingPolicy(); 
TimeBoundScalingPolicy.find({enabled : true}, function(err, result){
	if(err)
		logger.error("error fetching details from table : "+err.message);

	for(var i in result){
		var policy = new Object();
		
		policy.securityGroup   = result[i].securityGroup;
		policy.enabled         = result[i].enabled;
		policy.downtime        = result[i].downtime;
		policy.uptime          = result[i].uptime;
		policy.currentState    = result[i].currentState;
		policy.pushbackTime    = result[i].pushbackTime;
		policy.noOfInstances   = result[i].noOfInstances;
		
		policyList.push(policy);
	}

	async.forEachSeries(policyList, iterator, function(err){
		if(err)
			logger.error("error : "+err.message);
	});
});

function iterator(policy, callback){
	logger.info("timebound scaling initiated for "+policy.securityGroup);

	var uptime         = parseInt(policy.uptime);
	var downtime       = parseInt(policy.downtime);
	var state          = policy.currentState;
	var pushbackTime   = policy.pushbackTime;

	var currentHour = new Date().getHours();
	
	var day = new Date().getDay();

	if(day == 0 || day == 6){
		if(pushbackTime == null || pushbackTime == "")
			stopPolicy(policy);
		else
			pushbackTimePolicy(policy);
	}
	else{
		if(currentHour >= uptime && currentHour < downtime)
			startPolicy(policy);
		else{
			if(pushbackTime == null || pushbackTime == "")
				stopPolicy(policy);
			else
				pushbackTimePolicy(policy);
		}
	}

	callback();
}

function startPolicy(policy){
	if(policy.currentState == "running"){
		logger.info(policy.securityGroup+" is up. No action required.");
	}
	else
		startEC2Instances(policy, false);		
}

function stopPolicy(policy){
	if(policy.currentState == "stopped")
		logger.info(policy.securityGroup+" is down. No action required.");
	else
		stopEC2Instances(policy, false);
}

function pushbackTimePolicy(policy){
	if(new Date() >= policy.pushbackTime){
		
		if(policy.currentState == "running")
			stopEC2Instances(policy, true);
		else
			startEC2Instances(policy, true);
	}
}

function startEC2Instances(policy, flag){
	async.waterfall([function cb(callback){callback(null, policy);}, getStoppedInstances, getInstances,
					startInstances], function(err, result){
		if (err) 
			logger.error("error starting ec2instances : "+err.message);
		else{
			logger.info(policy.securityGroup+" : timebound policy complete.");
			if(flag == true){
				updatePolicyPushbacktime(policy);	
			}
		}
	});
}

function stopEC2Instances(policy, flag){
	async.waterfall([function cb(callback){callback(null, policy);}, getRunningInstances, getInstances,
					stopInstances], function(err, result){
		if(err)
			console.log("error stopping ec2instances : "+err.message);
		else{
			logger.info(policy.securityGroup+" : timebound policy complete.");
			if(flag == true){
				updatePolicyPushbacktime(policy);
			}	
		}
	});
	getInstances, get
}

function getRunningInstances(policy, callback){
	
	logger.info("fetching "+policy.securityGroup+" active instances.");

	var securityGroup = policy.securityGroup;
	ec2.client.describeInstances(function(err, data){
		if(err)
			logger.error("error fetching "+policy.securityGroup+" running instances : "+err.message);
		else{
			var runningInstanceList = new Array();			
			for(var res in data.Reservations){
				for(var ins in data.Reservations[res].Instances){
					if(data.Reservations[res].Instances[ins].SecurityGroups[0].GroupName == securityGroup /*&&
					   data.Reservations[res].Instances[ins].State.Name == "running"*/){
						runningInstanceList.push(data.Reservations[res].Instances[ins].InstanceId);
					}
				}
			}
		}
		callback(null, runningInstanceList, policy);
	});
}

function getNoOfStoppedInstances(policy, callback){
	ec2.client.describeInstances(function(err, data){
		if(err)
			logger.error("error fetching "+policy.securityGroup+" stopped instances : "+err.message);
		else{
			var noOfStoppedInstances = 0;
			for(var res in data.Reservations){
				for(var ins in data.Reservations[res].Instances){
					if(data.Reservations[res].Instances[ins].SecurityGroups[0].GroupName == securityGroup &&
					   data.Reservations[res].Instances[ins].State.Name == "stopped"){
						stoppedInstanceList.push(data.Reservations[res].Instances[ins].InstanceId);
					}
				}
			}
		}
		callback(null, )
	});
}

function getStoppedInstances(policy, callback){
	
	logger.info("fetching "+policy.securityGroup+" stopped instances.");

	var securityGroup = policy.securityGroup;
	
	ec2.client.describeInstances(function(err, data){
		if(err)
			logger.error("error fetching "+policy.securityGroup+" stopped instances : "+err.message);
		else{
			var stoppedInstanceList = new Array();			
			for(var res in data.Reservations){
				for(var ins in data.Reservations[res].Instances){
					if(data.Reservations[res].Instances[ins].SecurityGroups[0].GroupName == securityGroup &&
					   data.Reservations[res].Instances[ins].State.Name == "stopped"){
						stoppedInstanceList.push(data.Reservations[res].Instances[ins].InstanceId);
					}
				}
			}
		}
		callback(null, stoppedInstanceList, policy);
	});
}

function getInstances(list, policy, callback){
	console.log("GET INSTANCES : LIST SIZE = "+list.length+"     "+policy.noOfInstances+"   "+policy.securityGroup);
	
	if(policy.currentState == "running"){
		var tempA = parseInt(policy.noOfInstances)/100;
		var tempB = Math.floor(tempA*list.length);
		console.log(tempA+"  "+tempB+"   "+policy.securityGroup);
		var count = 0;
		var newList = new Array();
		for(var i in list){
			if(count == tempB)
				break;
			else{
				newList.push(list[i]);
				count++;
			}
		}
		callback(null, newList, policy);		
	}
	else{
		callback(null, list, policy);
	}
}

function stopInstances(newList, policy, callback){
	
	var tracker = updateTracker(policy, tracker);
	tracker.action = "STOP";

	var params = {
		InstanceIds : newList,
		Force       : true
	};

	ec2.client.stopInstances(params, function(err, data){
		if(err){
			logger.error("error stopping "+policy.securityGroup+" instances : "+err.message);
			tracker.messageType = "ERROR";
			tracker.message     = err.message;
		}
		else{
			var instances = "";
			var counter   = 0;
			for(var i in data.StoppingInstances){
				instances = instances+data.StoppingInstances[i].InstanceId+",";
				counter++;
			}
			tracker.instances   = instances;
			tracker.messageType = "SUCCESS";

			logger.info(counter+" "+policy.securityGroup+" instances successfully stopped : "+temp.substring(0, temp.length - 1));
			policyTable.updateTimeBoundScalingPolicyState(policy.securityGroup, "stopped");
		}

		callback();
	});
}

function startInstances(newList, policy, callback){
	
	var tracker = updateTracker(policy, tracker);
	tracker.action = "START";

	var params = {
		InstanceIds : newList,
	};

	ec2.client.startInstances(params, function(err, data){
		if(err){
			logger.error("error starting "+policy.securityGroup+" instances : "+err.message);
			tracker.messageType = "ERROR";
			tracker.message     = err.message;
		}
		else{
			var instances = "";
			var count     = 0;
			for(var i in data.StartingInstances){
				instances = instances+data.StartingInstances[i].InstanceId+",";
			}

			tracker.instances   = instances;
			tracker.messageType = "SUCCESS";

			logger.info(count+" "+policy.securityGroup+" instances started sucessfully : "+instances.substring(0, instances.length - 1));
			policyTable.updateTimeBoundScalingPolicyState(policy.securityGroup, "running");
		}
		
		callback();
	});
}

function updateTracker(policy, tracker){
	tracker = new Object();
	
	tracker.securityGroup = policy.securityGroup;
	tracker.time          = new Date();
	tracker.previousState = policy.currentState;
	
	return tracker;
}