AWS = require('aws-sdk');
var fs = require('fs');
var exec = require('child_process').exec,
    child;
var async=require('async');
var cfg=require('./config.js');
var s3Client=require('./S3Client.js');
var track=require('./Tracking.js');
var tree=require('treehash');
var walk    = require('walk');
var logging=require('./logging.js');





//launchCopyS3();
exports.launchCopyS3=function launchCopyS3(){
      console.log("copy launched");
    var kvmap = cfg.config["KEY_REGION_S3_GLACIER"];  
     var gpId=generateGroupId(Object.keys(kvmap),kvmap[Object.keys(kvmap)][0].sorce,kvmap[Object.keys(kvmap)][0].dest);
    async.forEachSeries(Object.keys(kvmap),iterator,function(err,callback){
        if(err)
        {
logging.logError("ERROR in launchCopyS3"+err);

            trackProcess("finalasyncCall","error in async For Each for account" +Object.keys(kvmap)+" MESSAGE :" +err,gpId,"F");
            callback(err);
        } 
        else{
            trackProcess("finalasyncCall","final callback called",gpId,"S");
        }   
    });

}


function iterator(credentials, callback){ 
 var gpId=generateGroupId(credentials,cfg.config["KEY_REGION_S3_GLACIER"][credentials][0].sorce,cfg.config["KEY_REGION_S3_GLACIER"][credentials][0].dest);  

    async.waterfall([function dummy(callback){callback(null, credentials,gpId);} ,s3Client.getSrcS3Client,
      s3Client.getDestGlacierClient,loadMongoToMap,getBuckets,createBucketArray,
      bucketParams,filterBuckets,getObjectsAndUpload],
        function(err,result ){
logging.logError("ERROR in iterator"+err);

        if(err){
           trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
            callback(err);
        }
        else{
            trackProcess("finalWaterfallCall","final Iterator callback",gpId,"completed");
            callback();}
        });
    }


function loadMongoToMap(s3,desGlacier,account,gpId,callback){

 var map=new Object();

  trackProcess("loadingMap","Loading metadata details from mongo to map",gpId,"S");
  track.trackS3Metadata.find(function(err,result){
  if(err){
logging.logError("ERROR in loadMongoToMap "+err);
      trackProcess("mapStatus","Loading from map to mongo failed because :" + err,gpId,"F");
    }else{
      for(var i in result){
      map[result[i].ObjectName]=result[i].LastModified;
    }
      trackProcess("mapStatus","mapLoaded",gpId,"S");
    }
  callback(null,s3,desGlacier,account,gpId,map)
  });
}


function getBuckets(s3,desGlacier,account,gpId,map,callback){
    trackProcess("getBuckets","Getting the list of buckets from S3",gpId,"S");
    s3.client.listBuckets(null,function(error,data){
     if(error){
logging.logError("ERROR in getBuckets "+error);
       trackProcess("listBucketStatus","Getting the list of buckets from S3 Failed because "+error,gpId,"F");
      }
      else{
        trackProcess("listBucketStatus","Getting the list of buckets from S3 succeeded ",gpId,"S");
        callback(null,data,desGlacier,account,s3,gpId,map);
      }  
  });
}


function createBucketArray(bucketData,desGlacier,account,s3,gpId,map,callback){

  trackProcess("createBucketArray","Creating bucket array",gpId,"S");
  var bucketArray=new Array();

//  bucketArray[3]="apacrdatakeyvaluemapsfailure";
 // bucketArray[1]="317993448580-ap-northeast-1";
 // bucketArray[0]="lis-busimages";
// bucketArray[2]="cloudwatchscript";
// bucketArray[2]="tests3toglacier";
//bucketArray[0]="lis-busimages";

for(var i in bucketData.Buckets){
bucketArray[i]=bucketData.Buckets[i].Name;
}
  callback(null,bucketArray,desGlacier,account,s3,gpId,map);
}

function bucketParams(bucketArray,desGlacier,account,s3,gpId,map,callback){
 
  var bucketParamArray=new Array();
    for(var buck in bucketArray){
      var key=new bucketParameters(bucketArray[buck],desGlacier,account,s3,gpId,map);
        bucketParamArray[buck]=key;
    }
    callback(null,bucketParamArray);

}

function bucketParameters(bucketName,desGlacier,account,s3,gpId,map){

  this.bucketName=bucketName;
  this.desGlacier=desGlacier;
  this.s3=s3;
  this.gpId=gpId;
  this.map=map;
this.account=account;
}

function filterBuckets(bucketArray,callback){
  trackProcess("filterBuckets","Filtering buckets only present in ap-southeast-1 Region",bucketArray.gpId,"S");

  async.filter(bucketArray,filterBucketsIterator,function(result){

    if(result){

        callback(null,result);
    }
  });

}

function filterBucketsIterator(bucket,callback){
  
 var obj1={Bucket:bucket.bucketName};
    bucket.s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
logging.logError("ERROR in filterBucketsIterator"+error);

        trackProcess("filterBucketStatus","Filter buckets failed because "+error,bucket.gpId,"F");
      }else{
        
      
          if(data.LocationConstraint=="ap-southeast-1"){
		trackProcess("filterBucketStatus","Filter criteria fulfilled by  "+bucket.bucketName,bucket.gpId,"S");           
		 callback(true);
          }   
          else{
            trackProcess("filterBucketStatus","Filter criteria not fulfilled by "+bucket.bucketName,bucket.gpId,"S");
            callback(false);
          }
      }
  });
}


function getObjectsAndUpload(bucketDataArray,callback){

  async.forEach(bucketDataArray,readBucketDataIterator,function(err){
      
      if (err){
logging.logError("ERROR in getObjectsAndUpload"+err);
        trackProcess("getObjectsAndUploadStatus","Error in getObjectsAndUpload "+err,bucketDataArray.gpId,"F");
        callback(err);
      }
      else{
        trackProcess("getObjectsAndUploadStatus"," getObjectsAndUpload Success",bucketDataArray.gpId,"S");
        callback();
      } 
  });

}


function readBucketDataIterator(bucketDataArray,callback){

async.waterfall([function dummy(callback){callback(null, bucketDataArray.bucketName,
  bucketDataArray.desGlacier,bucketDataArray.s3,bucketDataArray.gpId,"",new Array(),bucketDataArray.map,bucketDataArray.account);},getObjectVersioning,createMapForObjectVersions,
  makeDirectoryForEachBucket,getObjectsForEachBucket,getPathOfFilesInEachBucket,createUploadParams,checkForObjectPresence,
  readAndUpload],function(err,result){
    if(err){
logging.logError("ERROR in readBucketDataIterator"+err);

      trackProcess("readBucketDataIteratorStatus","Error in readBucketDataIterator "+err,bucketDataArray.gpId,"F");
      callback(null);
    }
    else{
      trackProcess("readBucketDataIteratorStatus","readBucketDataIterator Success",bucketDataArray.gpId,"S");
     deleteBucketFolder(bucketDataArray.bucketName);
      callback(null);
    }
  });
}

function deleteBucketFolder(bucketName){

var cmd="rm  -rf "+cfg.config["BASE_PATH_FOR_FILE_DOWNLOAD"]+bucketName+"/";
  child = exec(cmd,function (error, stdout, stderr) {
      if (error) {
logging.logError("ERROR in deleteBucketFolder"+error);

            console.log('exec error: ' + error);
trackProcess("deleteStatus","delete failed for bucket" + bucketName+"ERROR" + error," ","F");
      }
      else{

trackProcess("deleteStatus","delete success for bucket" + bucketName," ","S");        
      }
  });

}




function getObjectVersioning(bucket,desGlacier,s3,gpId,keymarker,objectDataArray,map,account,callback){




  trackProcess("getObjectVersioning","Getting Object Versioning ",gpId,"S");
  var obj={Bucket:bucket,KeyMarker:keymarker};

  s3.client.listObjectVersions(obj,function(err,data){
    if(err){
logging.logError("ERROR in getObjectVersioning"+err);
      trackProcess("getObjectVersioningStatus","Getting Object Versioning failed for "+bucket+" because "+err,gpId,"F");
    }else{
      trackProcess("getObjectVersioningStatus","Getting Object Versioning succeded For bucket "+bucket,gpId,"S");

      objectDataArray= objectDataArray.concat(data.Versions);
      if(data.IsTruncated==true){
        getObjectVersioning(bucket,desGlacier,s3,gpId,data.NextKeyMarker,objectDataArray,map,account,callback);

      }else{
        callback(null,bucket,desGlacier,objectDataArray,gpId,map,account);
      }

    }

  });

}


function createMapForObjectVersions(bucket,desGlacier,data,gpId,map,account,callback){
var objMap=new Object();
  
  trackProcess("objectVersioning","Creating map for object Versioning data",gpId,"S");
  for(var obj in data){
    var keysplit=data[obj].Key.split("/");
    var len=keysplit.length;
    if(keysplit[1]==undefined){
       objMap[data[obj].Key]=data[obj].LastModified;
    }

    else{
      objMap[keysplit[len-1]]=data[obj].LastModified;

    } 
  }
  callback(null,bucket,desGlacier,objMap,gpId,map,account);
}
 
function makeDirectoryForEachBucket(bucketName,desGlacier,objMap,gpId,map,account,callback){

  trackProcess("makeDirectory","Making directory for each bucket",gpId,"S");
  var cmd="mkdir -p "+cfg.config["BASE_PATH_FOR_FILE_DOWNLOAD"]+bucketName;
  child = exec(cmd,function (error, stdout, stderr) {
      if (error) {
logging.logError("ERROR in makeDirectoryForEachBucket"+error);
       trackProcess("makeDirectoryStatus","Error in Making directory for"+bucketName+" Error"+error,gpId,"F");
      }
      else{
        trackProcess("makeDirectoryStatus","Success in Making directory for"+bucketName,gpId,"S");
        
        callback(null,bucketName,desGlacier,gpId,objMap,map,account);
      }
  });
}


function getObjectsForEachBucket(bucketName,desGlacier,gpId,objMap,map,account,callback){

  trackProcess("getObjects","Getting Objects for Bucket "+bucketName,gpId,"S");  
	var cmd="s3cmd --config=/home/ubuntu/code/"+account+".txt get --recursive s3://"+bucketName+" bucket_data/"+bucketName+ "  --force > junk.txt 2>&1";
	child = exec(cmd,function (error, stdout, stderr) {

    	if (error) {
logging.logError("ERROR in getObjectsForEachBucket"+error);
        trackProcess("getObjectsStatus","Getting Objects for Bucket "+bucketName+" Failed because "+error+" "+stderr,gpId,"F");  

      			
    	}
    	else{


        trackProcess("getObjectsStatus","Getting Objects for Bucket "+bucketName+" Succeeded",gpId,"S");  
				callback(null,bucketName,desGlacier,gpId,objMap,map,account);}
});
}


function getPathOfFilesInEachBucket(bucketName,desGlacier,gpId,objMap,map,account,callback){

  trackProcess("getPathOfFiles","Getting path of files in bucket "+bucketName,gpId,"S");  
  
  var files   = [];
  var walker  = walk.walk(cfg.config["BASE_PATH_FOR_FILE_DOWNLOAD"]+bucketName, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    files.push(root + '/' + stat.name);
    next();
  });

  walker.on('end', function() {
    callback(null,files,desGlacier,gpId,objMap,map);
  });
 
}


function createUploadParams(pathArray,desGlacier,gpId,objMap,map,callback){
  var uploadArray=new Array();
  for(var path in pathArray){

    var archiveDes=pathArray[path].replace(/\//gi,".").replace(".home.ubuntu.code.disasterrecovery-s3-0406.bucket_data.","");
    var len=pathArray[path].split('/').length;
    var fileName=pathArray[path].split('/')[len-1];
    var pathKey=new uploadParams(pathArray[path],desGlacier,archiveDes,fileName,gpId,objMap,map);
      uploadArray[path]=pathKey;
  }

  callback(null,uploadArray);
}



function uploadParams(path,desGlacier,archiveDes,fileName,gpId,objMap,map){

  this.path=path;
  this.desGlacier=desGlacier;
  this.archiveDes=archiveDes;
  this.fileName=fileName;
  this.gpId=gpId;
  this.objMap=objMap;
  this.map=map;

}
function filter(srcArray){
var count =srcArray.length;
var array = new Array();
  for(var element=0;element<srcArray.length;element++){
    
    if(!(filterObjectsIterator(srcArray[element],array))){
          // array.push(srcArray[element]);
srcArray.splice(element,1);
element=element-1;
    }
  }
track.saveFilterObjectTracker(array);
return srcArray;
}
//to upload bulk array to mongo
function uploadFilterObjectArray(schemaAttrb,message,groupId,status){
  this.schemaAttrb=schemaAttrb;
  this.message=message;
  this.groupId=groupId;
  this.status=status;
}


function trackFilterProcess(schemaAttrb,message,groupId,status,array){
  
array.push(new uploadFilterObjectArray(schemaAttrb,message,groupId,status));
}


function checkForObjectPresence(uploadArray,callback){

  trackProcess("FilterObjects","Filtering Objects If already present in the destination",uploadArray.gpId,"S");  
       
  callback(null,filter(uploadArray));

}

function filterObjectsIterator(uploadArray,array){

  if(uploadArray.map[uploadArray.archiveDes]==undefined){
    
 trackFilterProcess("objectNotPresent","Object "+uploadArray.fileName+" is not present in destination..So adding",uploadArray.gpId,"S",array); 
          return true;

          }   
          else if(uploadArray.map[uploadArray.archiveDes] < uploadArray.objMap[uploadArray.fileName]){
    
 trackFilterProcess("objectModified","Object "+uploadArray.fileName+" is modified since last time..So adding",uploadArray.gpId,"S",array);
            return true;
          }
          else{
 trackFilterProcess("objectPresent","Object "+uploadArray.fileName+" is  present in destination..So not  adding",uploadArray.gpId,"S",array);
    
            return false;
          }


}
function acheckForObjectPresence(uploadArray,callback){

  trackProcess("FilterObjects","Filtering Objects If already present in the destination",uploadArray.gpId,"S");  
  async.filter(uploadArray,filterObjectsIterator,function(result){

    
      trackProcess("FilterObjectsResult","Final Result after Filtering Objects "+result,uploadArray.gpId,"S");  
       
        callback(null,result);
      // }
            
    });

}

function afilterObjectsIterator(uploadArray,callback){

  if(uploadArray.map[uploadArray.archiveDes]==undefined){
        trackProcess("objectNotPresent","Object "+uploadArray.archiveDes +" is not present in destination..So adding",uploadArray.gpId,"S");    
            callback(true);

          }   
          else if(uploadArray.map[uploadArray.archiveDes] < uploadArray.objMap[uploadArray.fileName]){
            trackProcess("objectModified","Object "+uploadArray.archiveDes+" has been modified..So adding",uploadArray.gpId,"S");    
            callback(true);
          }
          else{
            trackProcess("objectPresent","Object "+uploadArray.archiveDes+" is already present in destination..So not adding",uploadArray.gpId,"S");    
            callback(false);
          }
}


function readAndUpload(fromPathArray,callback){
 
	async.forEachLimit(fromPathArray,500,uploadBucketDataIterator,function(err){
 		if (err){
logging.logError("Error in readAndUpload"+err); 
     trackProcess("readAndUploadStatus"," Error in readAndUpload Series" + err,fromPathArray.gpId,"F");    
 			callback(err);
 		}
 		else{
      trackProcess("readAndUploadStatus","readAndUpload Success" ,fromPathArray.gpId,"S");    
        callback();
 		}	
	});

}

function uploadBucketDataIterator(fromPathArray,callback) {
	async.waterfall([function dummy(callback){callback(null, fromPathArray.path,fromPathArray.desGlacier,fromPathArray.fileName,fromPathArray.gpId,fromPathArray.archiveDes,fromPathArray.objMap);}
    ,readFilesFromDirectory,calculateCheckSum,uploadToGlacier,logGMetadata],
    function(err,result){

		  if(err){
logging.logError("Error in uploadBucketDataIterator"+err);
        trackProcess("uploadBucketDataStatus"," Error in uploadBucketDataIterator" + err,fromPathArray.gpId,"F");    
 			  callback(null);
 		 }
 		 else{
      trackProcess("uploadBucketDataStatus","uploadBucketDataIterator success",fromPathArray.gpId,"S");    
 			  callback(null);
 		}
 	});
 	
}

function readFilesFromDirectory(path,desGlacier,fileName,gpId,archiveDes,objMap,callback){

  trackProcess("readFilesFromDirectory","Reading file for "+fileName,gpId,"S");    
  fs.readFile(path, function (err, data) {
    if (err){
	logging.logError("Error in readFilesFromDirectory"+err);

      trackProcess("readFilesStatus","Error in Reading file for "+fileName+"Beacuse " + err,gpId,"F");    
    } 
    else{
      trackProcess("readFilesStatus"," Reading file success for "+fileName,gpId,"S");

      var buffer = new Buffer(data,"utf-8");
      callback(null,buffer,path,desGlacier,fileName,gpId,archiveDes,objMap);
    }
  });
}

function calculateCheckSum(buffer,path,desGlacier,fileName,gpId,archiveDes,objMap,callback){

  fs.readFile(path, function(err, buffer) {
  var sha = tree.getTreeHashFromBuffer(buffer)

  callback(null,buffer,path,desGlacier,fileName,gpId,archiveDes,sha,objMap);
});
  
 
  
}


function uploadToGlacier(buffer,path,desGlacier,fileName,gpId,archiveDes,checksum,objMap,callback){
trackProcess("uploadToGlacier","Uploading File "+fileName+"to Glacier" ,gpId,"S");

  var obj={vaultName:"s3copyprod",accountId:'317993448580',archiveDescription:archiveDes,
  checksum:checksum
  ,body:buffer};

  desGlacier.client.uploadArchive(obj,function(error,data){
    if(error){
logging.logError("ERROR in uploadToGlacier"+error);
      trackProcess("uploadToGlacierStatus","Uploading File "+fileName+"to Glacier failure because "+error ,gpId,"F");
     callback(null,"",fileName,gpId,"",objMap);
    }else{
      trackProcess("uploadToGlacierStatus","Uploading File "+fileName+"to Glacier Success",gpId,"S");
      logging.logInfo("DATA"+JSON.stringify(data)+"FOR FILENAME"+fileName);
    callback(null,archiveDes,fileName,gpId,data.archiveId,objMap);  
    }
    
  });
}
function logGMetadata(archiveDes,fileName,gpId,archiveId,objMap,callback){
if(archiveDes==""){
    
    callback(null);
  }
else{
  trackProcess("logMetadata","Logging metadata: archiveDes "+archiveDes+" Last Modified Date"+objMap[fileName]+" to mongo" ,gpId,"S");
  track.saveS3MetadataToMongo(archiveDes,objMap[fileName],archiveId);
  callback(null);

}
 }

function generateGroupId(account,sorce,dest){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    today = mm+'/'+dd+'/'+yyyy;

   return account+"_"+today+"_"+sorce+"_"+dest;

}

function generateTimestamp(){

    var today=new Date();
    var date=today.toDateString();
    var time=today.toTimeString();
    return date+" "+time;
}


function trackProcess(schemaAttrib, message,gpId,status){

    track.copySaveTrack(schemaAttrib,message,message,generateTimestamp(),gpId,status);

}
exports.trackProcess=trackProcess;


//For testing purpose
function uploadToS3(buffer,path,desGlacier,fileName,gpId,archiveDes,checksum,callback){
  
  trackProcess("uploadToS3","Uploading File "+fileName+"to S3" ,gpId,"S");
  var obj={Bucket:"rawss3test",Key:archiveDes,Body:buffer}
  desGlacier.client.putObject(obj,function(error,data){
    if(error){
      trackProcess("uploadToS3Status","Error in Uploading File "+fileName+"to S3 because "+error ,gpId,"F");
    } 
     else{
      trackProcess("uploadToS3Status","Success in Uploading File "+fileName+"to S3 ",gpId,"S");
    //console.log("DATA Returned"+JSON.stringify(data));
      
    }
    callback(null,archiveDes,fileName,gpId);
    });
}

function logMetadata(archiveDes,fileName,gpId,callback){

  trackProcess("logMetadata","Logging metadata: archiveDes "+archiveDes+" Last Modified Date"+objMap[fileName]+" to mongo" ,gpId,"F");
  track.saveS3MetadataToMongo(archiveDes,objMap[fileName]);
  callback(null);

}

