var schedule = require('node-schedule');
var ec2DisasterRec=require('./ec2DisasterRecovery.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 7)];
rule.hour = cfg.config["ruleCopyHour"];
rule.minute = cfg.config["ruleCopyMinute"];;

var j = schedule.scheduleJob(rule, function(){
	
	track.copySaveTrack("schedulerTriggerTime",new Date(),"Scheduler for copy Triggered at ");

	ec2DisasterRec.launchCopySnapShots();

	});

