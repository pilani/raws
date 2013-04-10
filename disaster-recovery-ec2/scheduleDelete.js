var schedule = require('node-schedule');
var ec2DisasterRec=require('./ec2DisasterRecovery.js');
var ec2Del=require('./ec2DeleteOlderImages.js');
var logging=require('./logging.js');
var cfg =require('./config.js');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 7)];
rule.hour = cfg.config["ruleDeleteHour"];
rule.minute = cfg.config["ruleDeleteMinute"];

exports.scheduleDelete=function scheduleDelete(){
	schedule.scheduleJob(rule, function(){	
		//made changes post commit
	ec2DisasterRec.trackProcess("schedulerTriggerTime","Scheduler for Delete Triggered at ","default","S");
    ec2Del.launchDelete();

  });
}