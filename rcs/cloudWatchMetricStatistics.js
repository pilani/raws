var client = require('./ec2client.js');
var async  = require('async');

var ec2        = client.getEC2Client();
var cloudwatch = client.getEC2CloudwatchClient();

exports.getCpuUtilization = function getCpuUtilization(instances, callback){
	var temp = instances;
	async.waterfall([function(callback){callback(null, temp);},
					 getCpu,
					 getAverageCpu
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error in getCpuUtilization : "+error);
 		else{
 			callback(null, data);
 		}
	});
}

function getCpu(instances, callback){
	async.forEach(instances, cpuIterator, function(error){
		if(error)
			console.log("Error in getCpu : "+error);
		else{
			callback(null, instances);
		}
	});
}

function cpuIterator(instance, callback){
	async.waterfall([function(callback){callback(null, instance);},
		             getCpuMetricStatistics,
		             getMetricValue
		             ],
		             function(error, data){
 		if(error)
 			console.log("Error in cpuIterator : "+error);
 		else{
 			instance.cpu = data;
 			callback(null, instance);
 		}
	});
}

function getCpuMetricStatistics(instance, callback){
	var cpuParameters = getCloudwatchMetricStatistics(instance.id, "CPUUtilization", "AWS/EC2", "Percent", 
												      "Average");
	callback(null, cpuParameters, instance);
}

function getAverageCpu(instances, callback){
	var averageCpu = 0;
	for(var i in instances){
		averageCpu = averageCpu + instances[i].cpu;
	}
	callback(null, averageCpu/instances.length);
}

exports.getMemoryUtilization = function getMemoryUtilization(instances, callback){
	var temp = instances;
	async.waterfall([function(callback){callback(null, temp);},
					 getMemory,
					 getAverageMemory
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error in getMemoryUtilization : "+error);
 		else{
 			callback(null, data);
 		}
	});
}

function getMemory(instances, callback){
	async.forEach(instances, memoryIterator, function(error){
		if(error)
			console.log("Error in getMemory : "+error);
		else{
			callback(null, instances);
		}
	});
}

function memoryIterator(instance, callback){
	async.waterfall([function(callback){callback(null, instance);},
		             getMemoryMetricStatistics,
		             getMetricValue
		             ],
		             function(error, data){
 		if(error)
 			console.log("Error in memoryIterator : "+error);
 		else{
 			instance.memory = data;
 			callback(null, instance);
 		}
	});
}

function getMemoryMetricStatistics(instance, callback){
	var nameSpace = "System/Linux";
	
	if(instance.platform == "windows")
		nameSpace = "System/Windows";

	var memoryParameters = getCloudwatchMetricStatistics(instance.id, "MemoryUtilization", nameSpace, "Percent", "Average");
	callback(null, memoryParameters, instance);
}

function getAverageMemory(instances, callback){
	var averageMemory = 0;
	for(var i in instances){
		averageMemory = averageMemory + instances[i].memory;
	}
	callback(null, averageMemory/instances.length);
}

exports.getNetworkUtilization = function getNetworkUtilization(instances, callback){
	var temp = instances;
	async.waterfall([function(callback){callback(null, temp);},
					 getNetwork,
					 getAverageNetwork
					 ],
					 function(error, data){
 		if(error)
 			console.log("Error in getNetworkUtilization : "+error);
 		else{
 			callback(null, data);
 		}
	});
}

function getNetwork(instances, callback){
	async.forEach(instances, networkIterator, function(error){
		if(error)
			console.log("error in getNetwork : "+error);
		else{
			callback(null, instances);
		}
	});
}

function networkIterator(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, 
		   			 getNetworkMetricStatistics,
		   			 getInstanceNetwork
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

function getNetworkMetricStatistics(instance, callback){
	async.parallel([
		function(callback){
			getNetworkIn(instance, callback);
		},
		function(callback){
			getNetworkOut(instance, callback);
		}],
		function(error, data){
			if(error)
				console.log("Error : "+error);
			else{
				var sum = 0;
				for(var i in data){
					sum = sum + data[i];
				}
				callback(null, sum);
			}
	});
}

function getNetworkIn(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, 
					 getNetworkInMetricStatistics,
					 getMetricValue
					 ],
					 function(error, data){
   		if(error)
   			console.log("Error : "+error);
   		else{
   			instance.networkIn = data;
   			callback(null, data);
   		}
	});
}

function getNetworkOut(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, 
					 getNetworkOutMetricStatistics,
					 getMetricValue
					 ],
					 function(error, data){
   		if(error)
   			console.log("Error : "+error);
   		else{
   			instance.networkOut = data;
   			callback(null, data);
   		}
	});
}

function getNetworkInMetricStatistics(instance, callback){
	var networkInParameters = getCloudwatchMetricStatistics(instance.id, "NetworkIn", "AWS/EC2", "Bytes", "Average");
	callback(null, networkInParameters, instance);
}

function getNetworkOutMetricStatistics(instance, callback){
	var networkOutParameters = getCloudwatchMetricStatistics(instance.id, "NetworkOut", "AWS/EC2", "Bytes", "Average");
	callback(null, networkOutParameters, instance);
}

function getInstanceNetwork(averageNetwork, callback){
	callback(null, averageNetwork/1048576);
}

function getAverageNetwork(instances, callback){
	var averageNetwork = 0;
	for(var i in instances){
		averageNetwork = averageNetwork + instances[i].network;
	}
	callback(null, averageNetwork/instances.length);
}

function getCloudwatchMetricStatistics(instanceId, metric, nameSpace, unit, statistic){
	var hourInMilliseconds = 1000 * 60 * 60;
	var endTime            = new Date();
	var startTime          = new Date(endTime.getTime() - hourInMilliseconds);
	
	var parameters = {
						MetricName  : metric,
		    			Namespace   : nameSpace,
		    			Period      : 60,
		    			Statistics  : [statistic],
		    			Unit        : [unit],
		    			Dimensions  : [{ Name: 'InstanceId', Value: instanceId}],
		    			StartTime   : startTime.toISOString('8601'),
		    			EndTime     : endTime.toISOString('8601')
	};

	return parameters;
}

function getMetricValue(parameters, instance, callback){
	cloudwatch.GetMetricStatistics(parameters, function(error, data){

		if(error)
			console.log("Error - GetMetricStatistics : "+error.message);
		else{

			var temp        = 0;
			var metricValue = 0;
			try{
				for(var i in data.Body.GetMetricStatisticsResponse.GetMetricStatisticsResult.Datapoints.member){
					temp = temp + parseInt(data.Body.GetMetricStatisticsResponse.GetMetricStatisticsResult.Datapoints.member[i].Average);
				}
			
				var noOfDataPoints = data.Body.GetMetricStatisticsResponse.GetMetricStatisticsResult.Datapoints.member.length;
				metricValue        = Math.round(temp/noOfDataPoints*100)/100;	
			}
			catch(error){
				metricValue = 0;
			}
			
		}
		
		callback(null, metricValue);
	});
}


