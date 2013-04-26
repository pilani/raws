var mongoose = require('mongoose');
var logging=require('./logging.js');
  
  mongoose.connect('mongodb://localhost/s3db2');

  var DB=mongoose.connection;
  DB.on('error',console.error.bind(console,'connection error'));
  DB.once('open', function callback(){

  	console.log("connection successfull");
    logging.logInfo("connection successfull");

  });

  var copyS3Schema = mongoose.Schema({
    schedulerTriggerTime                :Date
   , finalasyncCall                     :String
  , finalWaterfallCall                  :String
  ,makeDirectoryStatus                  :String
  , loadingMap                          :String
  , mapStatus                           :String
  , getBuckets                          :String
  ,groupId                              :String
  ,listBucketStatus                     :String
  ,createBucketArray                    :String
  ,timestamp                            :String
  ,status                               :String
  ,filterBuckets                        :String
  ,filterBucketStatus                   :String
  ,getObjectsAndUploadStatus            :String
  ,readBucketDataIteratorStatus         :String
  ,getObjectVersioning                  :String
  ,getObjectVersioningStatus            :String
  ,objectVersioning                     :String
  ,trackReportStatus                    :String
  ,makeDirectory                        :String
,getObjects                             :String
,getObjectsStatus                       :String
,getPathOfFiles                         :String
,FilterObjects                          :String
,FilterObjectsResult                    :String
,objectNotPresent                       :String
,objectModified                         :String
,objectPresent                          :String
,readAndUploadStatus                    :String
,uploadBucketDataStatus                 :String
,readFilesFromDirectory                 :String
,readFilesStatus                        :String
,createArchiveDes                       :String
,uploadToS3                             :String
,uploadToS3Status                       :String
,logMetadata                            :String

});



  var S3MetadataSchema = mongoose.Schema({
    ObjectName:String,
    LastModified:Date
  });
  

  var trackS3Metadata = mongoose.model('savemetadata',S3MetadataSchema);
  exports.trackS3Metadata=trackS3Metadata;
  var s3Copy = mongoose.model('saves3tracker',copyS3Schema);

  exports.saveS3MetadataToMongo=function saveS3MetadataToMongo(ObjectName,creationDate){

  var trackMetadata = new trackS3Metadata({});
  trackMetadata.setValue("ObjectName",ObjectName);
  trackMetadata.setValue("LastModified",creationDate);
  trackMetadata.save(function(err,result){

         saveTracker(err,result);

    });
  }


function saveTracker(err,result){
    
    if(err){
    
        logging.logError("ERROR in saving to mongo Db"+err);
    }
    else{
        //console.log("RESULT" + result);
    }
}


exports.copySaveTrack=function copySaveTrack(schemaAttrib, message,trackReportStatus,timestamp,gpId,status){

    var track = new s3Copy({});
   
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

    s3Copy.find().sort({timestamp:-1}).limit(1).exec(function(err, result) { 
     
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
   
    s3Copy.find({timestamp:{$regex:date}},function(err,result){
     
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