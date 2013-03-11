var express = require('express'),mongoose = require('mongoose')
  , passport = require('passport'),Schema = mongoose.Schema
  , util = require('util'),stylus = require('stylus'),nib=require('nib')	
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,logger= require('./logger.js')
,authhelper = require('./auth/authhelper.js'),router = require('./router.js');



var app = express.createServer();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
// configure Express
  app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard c' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  authhelper.initialize(app);
  app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

router.setup(app);


app.listen(3000);




function loggit(mess){
logger.log(mess);
}

