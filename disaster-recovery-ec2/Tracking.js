var mongoose = require('mongoose');
var logging=require('./logging.js');
  
  mongoose.connect('mongodb://localhost/newDB7');

  var DB=mongoose.connection;
  DB.on('error',console.error.bind(console,'connection error'));
  DB.once('open', function callback(){

  	console.log("connection successfull");
    logging.logInfo("connection successfull");

  });

  var trackCopySchema = mongoose.Schema({
    schedulerTriggerTime: Date
   , accountName:         String
  , fetchngLstOfSecGps  : String
  , nosOfSecGpsFetchd   : String
  , fetchngLstOfAMIs    : String
  , nosOfAmisFetchd     : String
  ,fetchngLstOfSnpshts  : String
  ,nosOfSnpshotsFetchd  : String
  ,snpshtCopyCld        : String
  ,groupId              : String
  ,snapShotCopySuccess  : String
  ,snapshotCopyFailure  : String
  ,timestamp            : Date
  ,status               :String
  ,finalasyncCall       :String
  ,finalWaterfallCall   :String
  ,noSnapsPresent       :String
  ,nosOfSnapsToBeCopied :String
  ,copyFailed           :String
  ,copyCmplt            :String
  ,copySnap             :String
});

 
var trackDeleteSchema=mongoose.Schema({
schedulerTriggerTime:     Date 
,fetchngLstOfSnpshts :    String
,nosOfSnapshotsToBeDltd : Number
,groupId              :   String
,dltTriggrdAt:            Date
,snapshotDltSuccess  :    String
,snapShotDltFailed  :     String

});

var trackCopy = mongoose.model('savetracker',trackCopySchema);

var trackDelete = mongoose.model('deletetracker',trackDeleteSchema);

function saveTracker(err,result){
    
    if(err){
    
        logging.logError("ERROR in saving to mongo Db"+err);
    }
    else{
        console.log("RESULT" + result);
    }
}


function copySaveTrack(schemaAttrib, message,timestamp,gpId,status){

    var track = new trackCopy({});
   
    track.setValue(schemaAttrib,message);
    track.setValue("status",status);
    track.setValue("groupId",gpId);
    track.setValue("timestamp",timestamp);
    if(status=="S"){
      logging.logInfo(message);
    }
    else{
      logging.logError(message);
    }

    track.save(function(err,result){

         saveTracker(err,result);

    });
}
//trackFailure();
function trackFailure(){
   var today = new Date();
   var date=today.toDateString();
   var d2=new Date();
   d2.setHours(today.getHours() - 24);
   var status; 

    trackCopy.find().sort({timestamp:-1}).limit(1).exec(function(err, result) { 
     
      for(var i in result){
          if(result[i].timestamp<d2){
          console.log("inside if");
          status="Failure";
          } 
          else if(result[i].status=="S"){
               status="Success";
          }
          else{
             status="Failure";
          }
      console.log("status" + status);
      }
    });
}
exports.trackFailure=trackFailure;

exports.copySaveTrack=copySaveTrack;

