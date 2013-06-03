var express = require('express');
obj = require('./Tracking.js'); 
var express = require('express')
  , stylus = require('stylus'),
   routes = require('./routes');
var app = express();
var s3=require('./copyS3.js');
var s3Schedule=require('./schedulerForS3Copy.js');
var s3Obj=require('./countS3Objects.js');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(stylus.middleware(
		  {
			src: __dirname + '/views',
	  		dest: __dirname + '/public'
		  }));  

  app.use(express.static(__dirname + '/public'));
});
// Routes
app.get('/', function (req, res) {
  res.render('index',
  { title : 'index' , body: '...'}
  )
})
app.get('/siteMonitor', routes.siteMonitor);
app.get('/copyStats',routes.copyStats);

app.get('/siteMonitorReport',obj.siteMonitoringDetailedReport);

app.get('/siteMonitorStatus', obj.siteMonitoringStatus);
app.get('/copyStatsReport',obj.copyStats);

app.listen(3000);

s3.launchCopyS3();
//s3Schedule.scheduleS3Copy();
s3Obj.launchS3Count();

