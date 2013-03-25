var express = require('express');
obj = require('./Tracking.js'); 
var express = require('express')
  , stylus = require('stylus'),
   routes = require('./routes');
var app = express();

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

app.get('/siteMonitorReport',obj.siteMonitoringDetailedReport);

app.get('/siteMonitorStatus', obj.siteMonitoringStatus);

app.listen(3000);


