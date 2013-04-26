var schedule = require('node-schedule');
var copyS3=require('./copyS3.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var trackProcess=require('./copyS3.js');

exports.scheduleS3Copy=function scheduleS3Copy(){

var j = schedule.scheduleJob({hour: cfg.config['Trigger_Hour'], minute: cfg.config['Trigger_Minute'],
 dayOfWeek: cfg.config['Trigger_Day']}, function(){

	copyS3.launchCopyS3();
	trackProcess.trackProcess("schedulerTriggerTime","Scheduler for copy S3 Triggered at ","default","S");
});
}