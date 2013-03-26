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
     schedulerTriggerTime:Date
   , accountName        :String
  , fetchngLstOfSecGps  :String
  , nosOfSecGpsFetchd   :String
  , fetchngLstOfAMIs    :String
  , nosOfAmisFetchd     :String
  ,groupId              :String
  ,AMICopySuccess       :String
  ,AMICopyFailure       :String
  ,timestamp            :String
  ,status               :String
  ,finalasyncCall       :String
  ,finalWaterfallCall   :String
  ,noAmisPresent        :String
  ,nosOfAmisToBeCopied  :String
  ,copyFailed           :String
  ,copyCmplt            :String
  ,copyAmi              :String
  ,trackReportStatus    :String
  ,finalDelAsyncCall     :String
,finalDelWaterfallCall :String
,fetchngImages         :String
,amisFetched           :String
,startDate             :String
,deleteinitiated       :String
,nosOfImagesToBeDltd   :String
,deleteImage           :String
,deRegisterAMI         :String
});

 
var trackDeleteSchema=mongoose.Schema({
schedulerTriggerTime   :Date 
,finalDelAsyncCall     :String
,finalDelWaterfallCall :Number
,groupId               :String
,fetchngImages         :Date
,amisFetched           :String
,startDate             :String
,deleteinitiated       :String
,nosOfImagesToBeDltd   :String
,deleteImage           :String
,deRegisterAMI         :String
,status                :String
,groupId               :String
,timestamp             :String
,trackReportStatus     :String

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


exports.copySaveTrack=function copySaveTrack(schemaAttrib, message,trackReportStatus,timestamp,gpId,status){

    var track = new trackCopy({});
   
    track.setValue(schemaAttrib,message);
    track.setValue("status",status);
    track.setValue("groupId",gpId);
    track.setValue("timestamp",timestamp);
    track.setValue("trackReportStatus",trackReportStatus);
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
function trackFailure(callback){
   var today = new Date();
   var d2=new Date();
   d2.setHours(today.getHours() -24);
   var status; 

    trackCopy.find().sort({timestamp:-1}).limit(1).exec(function(err, result) { 
     
      for(var i in result){
        var d=new Date(result[i].timestamp);
          if(d<d2){
             status="Failure";
          } 
          else if(result[i].status=="S"){
               status="Success";
          }
          else{
             status="Failure";
          }
      }
      callback(status);
    });
}

function trackFailureReport(callback){
   var today = new Date();
   var statusArray=new Array();
   var date=today.toDateString();
   
    trackCopy.find({timestamp:{$regex:date}},function(err,result){
     
      for(var i in result){
          
      statusArray[i]=new monitorParams(result[i].trackReportStatus,result[i].timestamp,result[i].groupId,result[i].status);
      }
      callback(JSON.stringify(statusArray));
    });
}

exports.siteMonitoringStatus = function(req,res) {
trackFailure(function (response) {
res.send(response);
res.end();
});
}; 

exports.siteMonitoringDetailedReport = function(req, res) {
trackFailureReport(function (response) {
res.send(response);
res.end();
});
};

function monitorParams(trackReportStatus,timestamp,gpId,status){

    this.trackReportStatus=trackReportStatus;
    this.timestamp=timestamp;
    this.gpId=gpId;
    this.status=status;
  

}
