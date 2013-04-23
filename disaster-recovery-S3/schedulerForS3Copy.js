var schedule = require('node-schedule');
var copyS3=require('./copyS3.js');
var cfg =require('./config.js');
//var track=require('./Tracking.js');
//var logging=require('./logging.js');


var j = schedule.scheduleJob({hour: 10, minute: 51, dayOfWeek: 2}, function(){

	copyS3.launchCopyS3();
    console.log('Copy Of S3 data to Glacier is launched');
});