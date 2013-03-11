var schedule = require('node-schedule');
var ec2Del=require('./ec2DeleteOlderSnapshots.js');
var logging=require('./logging.js');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 7)];
rule.hour = 12;
rule.minute = 17;

var j = schedule.scheduleJob(rule, function(){

	console.log("Scheduler for delete  Triggered at " + new Date());
	logging.logInfo("Scheduler for delete  Triggered at " + new Date());

	new track.trackDelete({schedulerTriggerTime:new Date()}).save(function(err,result){

		track.saveTracker(err,result);

	});
  
   ec2Del.launchDelete();

  });