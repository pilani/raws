var logger = require('./logger.js').logger;

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/testdb');
/*mongoose.connect('mongodb://localhost/TimeBoundScaling');*/

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
	console.log("connection successful");
});

var tbsTrackerSchema = mongoose.Schema({
	securityGroup   : String,
	enabled         : Boolean,
	downtime        : String,
	uptime	        : String,
	currentState    : String,
	pushbackTime  	: Date,
	noOfInstances   : String
});

var TBSTracker = mongoose.model('TBSTracker', tbsTrackerSchema);