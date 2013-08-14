var express  = require('express');
var express  = require('express'),
    stylus   = require('stylus'),
    routes   = require('./routes');
obj3         = require('./screen3.js');
obj1         = require('./screen1.js');
var app      = express();

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

app.get('/', function (req, res) {
  res.render('index',
  { title : 'index' , body: '...'}
  )
})

/*app.get('/pltDisasterRecovery',    routes.pltDisasterRecovery);
app.get('/pltEC2DisasterRecovery', obj.pltDisasterRecovery);*/

app.get('/screen3',    routes.screen3);
app.get('/rcsScreen3', obj3.screen3);

app.get('/screen1',    routes.screen1);
app.get('/rcsScreen1', obj1.screen1);

app.listen(3000);


