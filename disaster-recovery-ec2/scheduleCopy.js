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
	
	ec2DisasterRec.trackProcess("schedulerTriggerTime","Scheduler for copy Triggered at ","default","S");

	ec2DisasterRec.launchCopyAMIs();

	});

