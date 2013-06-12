var schedule = require('node-schedule');
var copyS3=require('./copyS3.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var trackProcess=require('./copyS3.js');

exports.scheduleS3Copy=function scheduleS3Copy(){

var j = schedule.scheduleJob({hour: cfg.config['Trigger_Hour'], minute: cfg.config['Trigger_Minute'],
 dayOfWeek: [0, new schedule.Range(1, 7)]}, function(){



	copyS3.launchCopyS3();
	trackProcess.trackProcess("schedulerTriggerTime","Scheduler for copy S3 Triggered at "+new Date(),"default","S");
});
}
