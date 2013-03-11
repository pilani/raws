var logger = require('./logger.js').logger;

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testdb');
/*mongoose.connect('mongodb://localhost/TimeBoundScaling');*/

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
	noOfInstances   : String
});

var TimeBoundScalingPolicy = mongoose.model('TimeBoundScalingPolicy', timeBoundSclaingPolicySchema);

exports.getTimeBoundScalingPolicy = function getTimeBoundScalingPolicy(){
	return TimeBoundScalingPolicy;
}

exports.updateTimeBoundScalingPolicyState = function updateTimeBoundScalingPolicyState(securityGroup, state){
	TimeBoundScalingPolicy.update({securityGroup : securityGroup}, {currentState : state}, function(err, result){
		if(err)
			logger.error("error updating "+securityGroup+" state : "+err.message);
		else
			logger.info(policy.securityGroup+" state updated to "+state+".");
	});
}

exports.updateTimeBoundScalingPolicyPushbackTime = function updateTimeBoundScalingPolicyPushbackTime(securityGroup){
	TimeBoundScalingPolicy.update({securityGroup : securityGroup}, {pushbackTime : ''}, 
							      function(err, result){
		if(err)
			logger.error("error updating "+securityGroup+" state : "+err.message);
		else
			logger.info(securityGroup+" state updated to "+state+".");
	});
}