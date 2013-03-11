var mongoose = require('mongoose');
/*mongoose.connect('mongodb://localhost/TimeBoundScaling');*/
mongoose.connect('mongodb://localhost/testdb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
			console.log("connection successful");
		});

var timeBoundSclaingPolicySchema = mongoose.Schema({
	securityGroup   : String,
	enabled         : Boolean,
	downtime        : String,
	uptime	        : String,
	currentState    : String,
	pushbackTime  	: Date,
	noOfInstances	: String
})

var TimeBoundScalingPolicy = mongoose.model('TimeBoundScalingPolicy', timeBoundSclaingPolicySchema)

var a = new TimeBoundScalingPolicy({
					securityGroup  : 'test1',
				    enabled        : true,
				    downtime       : '18',
				    uptime         : '8',
				    currentState   : 'stopped',
				    pushbackTime   : '',
				    noOfInstances  : '50'
				  });

var b = new TimeBoundScalingPolicy({
					securityGroup  : 'test2',
				    enabled        : true,
				    downtime       : '18',
				    uptime         : '8',
				    currentState   : 'stopped',
				    pushbackTime   : '',
				    noOfInstances  : '50'
				  });


/*var date = new Date();
var temp = new Date(2013, 01, 11, 15, 0, 0, 0);
if(new Date() >= temp)
	console.log("date is greater. temp - "+temp+"  date - "+date);
else
	console.log("temp is greater : "+temp);
*/


/*var a = new TimeBoundScalingPolicy({
					securityGroup  : 'boss-main-prod-security-group',
				    enabled        : true,
				    downtime       : '20',
				    uptime         : '8',
				    currentState   : 'stopped',
				    pushbackTime   : '',
				    noOfInstances  : '50%'
				  });
var b = new TimeBoundScalingPolicy({
					securityGroup  :  'nagois',
				    enabled        :  true,
				    downtime       :  '20',
				    uptime         :  '8',
				    currentState   :  'stopped',
				    pushbackTime   :  '',
				    noOfInstances  : '50%'
				  });
var c = new TimeBoundScalingPolicy({
					securityGroup  :  'rb-main-prod-security-group',
				    enabled        :  true,
				    downtime       :  '20',
				    uptime         :  '8',
				    currentState   :  'stopped',
				    pushbackTime   :  '',
				    noOfInstances  : '50%'
				  });
var d = new TimeBoundScalingPolicy({
					securityGroup  :  'ss-main-prod-security-group',
				    enabled        :  false,
				    downtime       :  '20',
				    uptime         :  '8',
				    currentState   :  'stopped',
				    pushbackTime   :  '',
				    noOfInstances  : '50%'
				  });
var e = new TimeBoundScalingPolicy({
					securityGroup  :  'rdata-main-prod-security-group',
				    enabled        :  true,
				    downtime       :  '20',
				    uptime         :  '8',
				    currentState   :  'running',
				    pushbackTime   :  '',
				    noOfInstances  : '50%'
				  });*/



/*a.save(function(err, a){
	if(err)
		console.log("error");
	else
		console.log("successful");
});*/

a.save(function(err, a){});
b.save(function(err, b){});

/*b.save(function(err, b){ });
c.save(function(err, c){ });
d.save(function(err, d){ });
e.save(function(err, e){ });*/

/*TimeBoundScalingPolicy.update({securityGroup : 'boss-main-prod-security-group'}, {currentState : 'AAAAAAAAAAAAAA'}, function(err, result){
	if(err)
		console.log("ERROR : "+err.message);
});*/

/*console.log(a.securityGroup+"  "+a.enabled+"  "+a.downtime+"  "+a.uptime+"  "+a.currentState+"  "+
			a.pushbackTime+"  "+a.noOfInstances);*/

/*var TimeBoundScalingPolicy = mongoose.model('TimeBoundScalingPolicy', timeBoundSclaingPolicySchema)*/

/*var policyList = new Array();*/

/*TimeBoundScalingPolicy.find(function(err, result){
	if(err)
		console.log("error");
	
	for(var i in result){
		var policy = new Object();
		
		policy.securityGroup   = result[i].securityGroup;
		policy.enabled         = result[i].enabled;
		policy.downtime        = result[i].downtime;
		policy.uptime          = result[i].uptime;
		policy.currentState    = result[i].currentState;
		policy.weekendDownTime = result[i].weekendDownTime;	
		policy.weekendUpTime   = result[i].weekendUpTime;	
		
		policyList.push(policy);
		
	}

	for(var i in policyList){
		console.log(policyList[i].securityGroup+"  "+policyList[i].enabled+"  "+policyList[i].downtime+"  "+policyList[i].uptime+"  "+policyList[i].curentState+"  "+
			    policyList[i].weekendDownTime+"  "+policyList[i].weekendUpTime);
	}
});*/


/*TimeBoundScalingPolicy.find(function(err, result){ // get only policy enabled security groups 
	if(err)
		console.log("error");
	
	for(var i in result){
		var policy = new Object();
		
		policy.securityGroup   = result[i].securityGroup;
		policy.enabled         = result[i].enabled;
		policy.downtime        = result[i].downtime;
		policy.uptime          = result[i].uptime;
		policy.currentState    = result[i].currentState;
		policy.weekendDownTime = result[i].weekendDownTime;	
		policy.weekendUpTime   = result[i].weekendUpTime;	
		
		policyList.push(policy);
	}

	//for(var i in policyList){
		//console.log(policyList[i].securityGroup+"  "+policyList[i].enabled+"  "+policyList[i].downtime+"  "+policyList[i].uptime+"  "+policyList[i].curentState+"  "+
		    	    //policyList[i].weekendDownTime+"  "+policyList[i].weekendUpTime);
	//}
	for(var i in policyList){
		if(policyList[i].curentState == "up"){
			if(currenttime - downtime <= 1000*60*3){
				stop instance;
				console.log("instance stopped successfully");
				set downtime to 2300 hrs next in TimeBoundScalingPolicy table	
				set currentState to 'down' if stop instance successfull
			}else{
				console.log("");
			}
		}
		else{
			if(currentTime - upTime <= 1000*60*3){
				start instance;
				console.log("instance is up");
				set upTime to 0800 in TimeBoundScalingPolicy table
				set currentState to 'up' if start instance successfull
			}
			else{
				console.log("");
			}
		}
	}
});*/

/*for(var i in policyList){
	if(policyList[i].curentState == "up"){
		if(currenttime later than downtime and earlier than uptime){
                	we need to shutdown
			stop instance or instances;
			console.log("instance stopped successfully");
			set currentState to 'down' if stop instance successfull
		}else {
			console.log("");
		}
	}else{
		if(currentTime ealier than downtime and laterthan uptime){
			start instance;
			console.log("instance is up");
			set currentState to 'up' if start instance successfull
		}else{
			console.log("");
		}
	}
}*/



/*Timeboundpolicy.find({

	
	asycn.forEachSeries([array,iterator,finallcallback)});
})

function iterator(policy,callback){
	//decide whether to shutodown or start
	//shutdown
	async.waterfall([getInstancesToshutdown,stopinstances],finallwcallback]);
}

function getInstancesToShutdown(callback){
	aws.findInstances(
		callback(null,"listofinstances");
	)
}


function stopinsances(variable,callback){
	aws.stop(
		callback();
	)
}*/



/*aysnc.forEachSeries([array,iterator,finalcallback]);

	
async.waterfall([getTimeBoundPolicies,,fun3],finalfun);

fun1(callback){


callback(null,"adad","adadad");
}

fun2(arg1,callback){


callback();
}


fun3(callback){

}

finalfun(err,results){


}*/


/*var uptime         = policy.uptime;
var downtime       = policy.downtime;
var state          = policy.currentState;
var offsetdowntime = policy.offsetDowntime;

var date        = new Date();
var currentHour = date.getHours();

if(date.getDay() == 0 || date.getDay() == 6){
	if(state == "up")
		stop instance;
	else
		console.log("");
}
else{
	if(offsetdowntime == null){
		if(currentHour >= uptime && currentHour <= downtime){
			if(state == "up")
				console.log(" ");
			else
				start instance;
		}
		else{
			if(state == "down")
				console.log(" ");
			else
				stop instance;
		}
	}
	else{
		if(date >= offsetdowntime){
			if(state == "up")
				console.log("  ");
			else{
				stop instance;
				update db here : set offsetDowntime to 0
			}
		}
	}	
}*/









/*old iterator*/
/*if(policy.currentState == "up"){
	if(currentHour >= policyDowntime && currentHour <= policyUptime){
		async.waterfall([function cb(callback){callback(null, policy);}, getAllInstances, getInstances, stopInstances], function(err, result){
			if(err)
				console.log("ERROR : "+err.message);
		});
	}
}
else{
	if(currentHour <= policyDowntime && currentHour >= policyUptime){
		async.waterfall([function cb(callback){callback(null, policy);}, getAllInstances, getInstances, startInstances], function(err, result){
			if (err) 
				console.log("ERROR : "+err.message);
		});
	}
}*/
















