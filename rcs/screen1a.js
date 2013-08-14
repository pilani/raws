var client = require('./ec2client.js');
var async  = require('async');

var ec2        = client.getEC2Client();
var cloudwatch = client.getEC2CloudwatchClient();

getEC2CloudwatchStatistics();

function getEC2CloudwatchStatistics(){
	console.log(new Date());
	async.waterfall([function(callback){callback(null);}, 
		             getInstances, 
					 getStatistics, 
					 getAverageStatistics], 
					 function(error, data){
		if(error)
			console.log("Error : "+error.message);
		else{
			console.log("Cpu : "+data.cpu+"  Memory : "+data.memory+"  Network : "+data.network);
			console.log(new Date());
		}
	});	
}

function getInstances(callback){
	var instances = new Array();

	ec2.client.describeInstances(function (error, data){
		if(error)
			console.log("Error fetching instances : "+error.message);
		else{
			for(var i in data.Reservations){
				for(var j in data.Reservations[i].Instances){
					if(data.Reservations[i].Instances[j].State.Name == "running"){
						
						var instance  	  = new Object();
						instance.id       = data.Reservations[i].Instances[j].InstanceId;
						instance.type     = data.Reservations[i].Instances[j].InstanceType;
						instance.platform = data.Reservations[i].Instances[j].Platform;

						instances.push(instance);	
					}
				}
			}
		}
		/*console.log("No of instances : "+instances.length);*/
		
		callback(null, instances);
	});
}

function getStatistics(instances, callback){
	async.forEach(instances, iterator, function(error){
		if(error)
			console.log("Error : "+error.message);
		else
			callback(null, instances);	
	});
}

function getAverageStatistics(instances, callback){

	/*console.log(" ");*/
	
	var statistics     = new Object();
	var averageCpu     = 0;
	var averageMemory  = 0;
	var averageNetwork = 0;
	
	for(var i in instances){
		averageCpu     = averageCpu     + instances[i].cpu;
		averageMemory  = averageMemory  + instances[i].memory;
		averageNetwork = averageNetwork + instances[i].network;
	}
	
	statistics.cpu     = averageCpu/instances.length;
	statistics.memory  = averageMemory/instances.length;
	statistics.network = averageNetwork/instances.length; 

	callback(null, statistics);
}

function iterator(instance, callback){
	async.parallel([
		function(callback){
			getCpu(instance, callback);
		},

		function(callback){
			getMemory(instance, callback);
		},

		function(callback){
			getNetwork(instance, callback);
		}],

		function(error, data){
			if(error)
				console.log("Error : "+error);
			else{
				callback();
			}
				
	});
}

function getCpu(instance, callback){
	async.waterfall([function(callback){callback(null, instance);}, 
					 getCpuMetricStatistics,
					 getMetricValue],
					 function(error, data){
		if(error)
			console.log("Error : "+error);
		else{
			instance.cpu = data;
			/*console.log("Average Cpu of instance "+instance.id+" : "+instance.cpu);*/
			callback(null, instance);
		}
	});
}

function getMemory(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, getMemoryMetricStatistics,
																	   getMetricValue],
																	   function(error, data){
		if(error)
			console.log("Error : "+error);
		else{
			instance.memory = data;
			/*console.log("Average Memory of instance "+instance.id+" : "+instance.memory);*/
			callback(null, instance);
		}
	});
}

function getNetwork(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, getNetworkMetricStatistics,
																	   getInstanceNetwork],
																	   function(error, data){
		if(error)
			console.log("Error : "+error);
		else{
			instance.network = data;
			/*console.log("Average Network of instance "+instance.id+" : "+instance.network);*/
			callback(null, instance);
		}
	});
}

function getCpuMetricStatistics(instance, callback){
	var cpuParameters = getCloudwatchMetricStatistics(instance.id, "CPUUtilization", "AWS/EC2", "Percent", "Average");
	callback(null, cpuParameters, instance);
}

function getMemoryMetricStatistics(instance, callback){
	var nameSpace = "System/Linux";
	
	if(instance.platform == "windows")
		nameSpace = "System/Windows";

	var memoryParameters = getCloudwatchMetricStatistics(instance.id, "MemoryUtilization", nameSpace, "Percent", "Average");
	callback(null, memoryParameters, instance);
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
				/*callback(null, sum/2);*/
				callback(null, sum);
			}
	});
}

function getInstanceNetwork(averageNetwork, callback){
	callback(null, averageNetwork/1048576);
}

function getNetworkIn(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, getNetworkInMetricStatistics,
																	   getMetricValue],
																	   function(error, data){
   		if(error)
   			console.log("Error : "+error);
   		else{
   			instance.networkIn = data;
   			/*console.log("NetworkIn of instance "+instance.id+" : "+instance.networkIn);*/
   			callback(null, data);
   		}
	});
}

function getNetworkOut(instance, callback){
	async.waterfall([function cb(callback){callback(null, instance);}, getNetworkOutMetricStatistics,
																	   getMetricValue],
																	   function(error, data){
   		if(error)
   			console.log("Error : "+error);
   		else{
   			instance.networkOut = data;
   			/*console.log("NetworkOut of instance "+instance.id+" : "+instance.networkOut);*/
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
				/*console.log("Error : "+instance.id+"   "+parameters.MetricName+"   "+parameters.Namespace+"  : "+error);*/
				metricValue = 0;
			}
			
		}
		
		callback(null, metricValue);
	});
}



