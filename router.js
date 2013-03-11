var authhelper = require('./auth/authhelper.js'),logger=require('./logger.js');

exports.setup = function(app){
app.get('/', function(req, res){

  res.render('index', { title:"RAWS" ,user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  loggit(JSON.stringify(req.user));
  res.render('account', { user: req.user.name });
});
// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google', authhelper.authenticate);
// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', authhelper.gcallback);
  
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//add your routing here

}
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


function loggit(mess){
logger.log(mess);
}

