var mongoose = require('mongoose');
var logging=require('./logging.js');
  
  mongoose.connect('mongodb://localhost/s3dbprod');

  var DB=mongoose.connection;
  DB.on('error',console.error.bind(console,'connection error'));
  DB.once('open', function callback(){

  	console.log("connection successfull");
    logging.logInfo("connection successfull");

  });

//schema defination
  var copyS3Schema = mongoose.Schema({
    schedulerTriggerTime                :String
   , finalasyncCall                     :String
  , finalWaterfallCall                  :String
  ,makeDirectoryStatus                  :String
  , loadingMap                          :String
  , mapStatus                           :String
  , getBuckets                          :String
  ,groupId                              :String
  ,archiveID                           :String
  ,listBucketStatus                     :String
  ,createBucketArray                    :String
  ,timestamp                            :Date
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
,uploadToGlacierStatus                   :String
,timestampString                         :String
});



  var S3MetadataSchema = mongoose.Schema({
    ObjectName:String,
    LastModified:Date
    ,archiveID  :String
  });

  var s3ObjCountSchema = mongoose.Schema({
    totObjects:Number,
    timestamp:Date,
    groupId:String

  });
  

  var trackS3Metadata = mongoose.model('savemetadata',S3MetadataSchema);
  exports.trackS3Metadata=trackS3Metadata;
  var s3Copy = mongoose.model('saves3tracker',copyS3Schema);
  var s3ObjCnt = mongoose.model('saves3objcount',s3ObjCountSchema);
  exports.s3ObjCnt=s3ObjCnt;


  exports.saves3objcount=function saves3objcount(totObjects,timestamp,groupId){
    var saves3objcnt=new s3ObjCnt({});
    saves3objcnt.setValue("totObjects",totObjects);
    saves3objcnt.setValue("timestamp",timestamp);
    saves3objcnt.setValue("groupId",groupId);
    saves3objcnt.save(function(err,result){

         saveTracker(err,result);

    });
  }

  

  exports.saveS3MetadataToMongo=function saveS3MetadataToMongo(ObjectName,creationDate,archiveID){
  var trackMetadata = new trackS3Metadata({});
  trackMetadata.setValue("ObjectName",ObjectName);
  trackMetadata.setValue("LastModified",creationDate);
  trackMetadata.setValue("archiveID",archiveID);

  trackMetadata.save(function(err,result){

         saveTracker(err,result);

    });
  }


exports.copySaveTrack=function copySaveTrack(schemaAttrib, message,trackReportStatus,timestampString,gpId,status){
    var track = new s3Copy({});
    track.setValue(schemaAttrib,message);
    track.setValue("status",status);
    track.setValue("groupId",gpId);
    track.setValue("timestampString",timestampString);
    track.setValue("trackReportStatus",trackReportStatus);
    track.setValue("timestamp",new Date());
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


function saveFilterObjectTracker(obj){
s3Copy.collection.insert(obj,{},function(err){
    
   if(err){
    console.log(" error in flushing to mongo "+err);
   }else{ console.log(" successfully flushed to mongo "+new Date()) };
 });

}


exports.saveFilterObjectTracker=saveFilterObjectTracker;

function saveTracker(err,result){
    
    if(err){
    
        logging.logError("ERROR in saving to mongo Db"+err);
    }
    else{
       console.log("RESULT" + result);
    }
}


//trackFailure();
function trackFailure(callback){
   var today = new Date();
   var d2=new Date();
   var totObjInS3;
   var noOfObjInGlacier;
   //d2.setHours(today.getHours() -24);
   d2.setDate(today.getDate()-10);
   console.log("d2...."+d2);
   var status; 
//to count the number of objects in glacier
  trackS3Metadata.distinct('archiveID').exec(function(err,archiveID){

noOfObjInGlacier=archiveID.length;
});
    s3Copy.find({status:"completed"}).sort({timestamp:-1}).limit(1).exec(function(err, results) { 
      if(err){

        console.log("EROOOOOOOOOOOORRRRRRRR"+err);
      }else{
if(results==""){
status="NOT FOUND";
console.log("EMPTY RESULTS"+results);
callback(status);}
else{
     s3ObjCnt.find({groupId:results[0].groupId}).sort({timestamp:-1}).limit(1).
  exec(function(err,result){
if(err){
console.log("ERRORRR"+err);

}else{if(result==""){
console.log("EMPTY RESULT"+result);
status="NOT FOUND";
callback(status);
}else{
    console.log("RESULT OF ..."+result);
totObjInS3=result[0].totObjects;
console.log("totObjInS3"+totObjInS3+"noOfObjInGlacier"+noOfObjInGlacier);
      for(var i in result){
         console.log("RESULT.............."+result);
        var d=result[i].timestamp;
       
          if(d<d2){
            console.log("INSIDE IF");
             status="Failure";
          } 

          else if(noOfObjInGlacier > 0.9*(totObjInS3)){
console.log("90% of total objects in S3"+0.9 * totObjInS3);

               status="Success";
          }
          else{
             status="Failure";
          }
      }
      callback(status);
}}
  });
  }}
    });
}

function trackFailureReport(callback){
   var today = new Date();
   var statusArray=new Array();
   var date=today.toDateString();
   
    s3Copy.find({timestampString:{$regex:date}},function(err,result){
     
      for(var i in result){
          
      statusArray[i]=new monitorParams(result[i].trackReportStatus,result[i].timestamp,result[i].groupId,result[i].status);
      }
      callback(JSON.stringify(statusArray));
    });
}


//getCopyStats();
function getCopyStats(callback){
  var statusArray=new Array();
  var testArray=new Array();
  var finalArray=new Array();
  var totObj;
  var group = {
   key: {groupId:""},
   //cond: {uploadToGlacierStatus:{$regex:"Uploading File "}},
   cond:{uploadToGlacierStatus:{$regex:"Uploading File "}},

   reduce: function(doc, out) {
      if(doc['status']=='S'){
         out.succeded++;
      }  
      else{
        out.failed++;
      }   
      out.total += doc.value;
   },
   initial: {
       total: 0,
       succeded: 0,
       failed:0
   },
   finalize: function(out) {
       out.total=out.failed+out.succeded;
   }
};
var count  =0;
s3Copy.collection.group(group.key, group.cond, group.initial, group.reduce, group.finalize, 
  true, function(err, results) {
    if(err){
      console.log("ERROR"+err);
    }
    console.log('group results %j', results);
    count= results.length;
var totSuc=0;
    for(var i in results){
      totSuc+=results[i].succeded;

       var cp = new Object();
       cp['succeded']      =results[i].succeded;
       cp['failed']=results[i].failed;
       cp['date']="0-00-0000";
       cp['source']=null;
       cp['dest']=null;
       cp['totObj']=0;
cp['totObjInGlacier']=totSuc;
      statusArray[results[i].groupId] = cp;
            
  s3ObjCnt.find({groupId:results[i].groupId}).sort({timestamp:-1}).limit(1).
  exec(function(err,result){
    if(err){
      console.log("ERROR"+err);
    }
    count--;
    
if(result==""){
  
}
else{
   
totObj=result[0].totObjects;
     gpId = result[0].groupId.split("_");
       date=gpId[1];
       source=gpId[2];
       dest=gpId[3];
     var copyParams = statusArray[result[0].groupId]; 
  copyParams['date']=date;
  copyParams['source']=source;
  copyParams['dest']=dest;
  copyParams['totObj']=totObj;
    }
   if(count==0){
   for(var key in statusArray){
    testArray.push(statusArray[key]);
      console.log(" sadasd "+JSON.stringify(statusArray)+"KEY"+key+"TESTARRAY"+JSON.stringify(testArray));
      
   }
   callback(JSON.stringify(testArray));
  }
  
  });
 }

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



exports.copyStats=function(req,res){
getCopyStats(function(response){
res.send(response);
res.end();

});
}


function monitorParams(trackReportStatus,timestamp,gpId,status){

    this.trackReportStatus=trackReportStatus;
    this.timestamp=timestamp;
    this.gpId=gpId;
    this.status=status;
  

}
 

