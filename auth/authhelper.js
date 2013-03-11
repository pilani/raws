var mongoose = require('mongoose')
  , passport = require('passport'),Schema = mongoose.Schema,logger=require('../logger.js')
  , util = require('util'),cfg=require('../config/config.js').cfg	
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var UserSchema = new Schema({
oauthtoken:String,
tokenSecret:String,
profile:Schema.Types.Mixed,
profileId:String,
username:String,
provider:String,
created:String,

});
 
mongoose.model('User', UserSchema);
mongoose.connect('mongodb://'+cfg["mongohost"]+'/'+cfg["dbname"]);

exports.initialize = function(app){
  app.use(passport.initialize());
  app.use(passport.session());
}
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  loggit("serializing user");
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  loggit("de- - serializing user");
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: cfg["GOOGLE_CLIENT_ID"],
    clientSecret: cfg["GOOGLE_CLIENT_SECRET"],
    callbackURL: "http://localhost:3000/auth/google/callback"
  },

function(token, tokenSecret, profile, done) {
loggit(token);
loggit(tokenSecret);
loggit(profile);
    var User = mongoose.model('User');
    User.findOne({profileId: profile.id},
      function(err, user) {
        if (!err && user != null) {
          var ObjectId = mongoose.Types.ObjectId;
          User.update({"_id": user["_id"]}, { $set: {lastConnected: new Date()} } ).exec();
        } else {
          var userData = new User({
            profile:profile,
	    tokenSecret:tokenSecret,
            provider: profile.provider,
            profileId: profile.id,
            created: Date.now(),
            oauthToken: token,
            username: profile.displayName,
            profilePicture: 'https://api.twitter.com/1/users/profile_image?screen_name=' + profile.username +'&size=bigger'
          });
          userData.save(function(err) {
            if (err) console.log(err);
            else console.log('Saving user...');
          });
        }
      }
      );
      var user = { id: profile.id, name: profile.displayName };
      done(null, user);
  }
));


exports.authenticate = function(req,res,next){   passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] })(req,res,next);};

 
	

exports.gcallback = function (req,res,next) { passport.authenticate('google', { failureRedirect: '/login' ,successRedirect:'/'})(req,res,next);};



function loggit(mess){
logger.log(mess);
}


