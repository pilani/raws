var AWS = require('aws-sdk');
var fs = require('fs');
var async=require('async');
var cfg=require('./config.js');
var s3Client=require('./S3Client.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');

//launchS3CountA();

function launchS3Count(){
logging.logInfo("count Objects in S3 launched");

	launchS3ObjCount();
	setTimeout(launchS3Count,1000*60*60*5);
}
exports.launchS3Count=launchS3Count;

function launchS3ObjCount(){

    logging.logInfo("launchS3Count launched");
    var kvmap = cfg.config["KEY_REGION_S3_GLACIER"];  
     var gpId=generateGroupId(Object.keys(kvmap),kvmap[Object.keys(kvmap)][0].sorce,kvmap[Object.keys(kvmap)][0].dest);
    async.forEachSeries(Object.keys(kvmap),getCountOfObjectsInS3,function(err,callback){
        if(err)
        {
           // trackProcess("finalasyncCall","error in async For Each for account" +Object.keys(kvmap)+" MESSAGE :" +err,gpId,"F");
            callback(err);
        } 
        else{
            //trackProcess("finalasyncCall","final callback called",gpId,"S");
        }   
    });

}



//exports.getCountOfObjectsInS3=getCountOfObjectsInS3;
function getCountOfObjectsInS3(creds,callback){
	var gpId=generateGroupId(creds,cfg.config["KEY_REGION_S3_GLACIER"][creds][0].sorce,cfg.config["KEY_REGION_S3_GLACIER"][creds][0].dest);  

    async.waterfall([function dummy(callback){callback(null, creds,gpId);} ,s3Client.getSrcS3Client,
      s3Client.getDestGlacierClient,getListOfBuckets,createArray,filterBuckets,countObjects],
        function(err,result ){
        if(err){
           //trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
            callback(err);
        }
        else{
            //trackProcess("finalWaterfallCall","final Iterator callback",gpId,"completed");
            callback();}
        });
    }
	


function getListOfBuckets(srcS3,desGlacier,account,gpId,callback){
    //trackProcess("getBuckets","Getting the list of buckets from S3",gpId,"S");
    srcS3.client.listBuckets(null,function(error,data){
     if(error){
       //trackProcess("listBucketStatus","Getting the list of buckets from S3 Failed because "+error,gpId,"F");
      }
      else{
        //trackProcess("listBucketStatus","Getting the list of buckets from S3 succeeded ",gpId,"S");
        callback(null,data,srcS3,gpId);
      }  
  });
}


function createArray(data,s3,gpId,callback){
	

	var bucketArray=new Array();
	var objArr=new Array();
//bucketArray[0]="lis-busimages";
/*bucketArray[1]="317993448580-ap-northeast-1";
bucketArray[2]="cv-log-99586e526342f5f0dd4cebfd8bdf7b2b";
bucketArray[3]="cloudwatchscript";
bucketArray[4]="tests3toglacier";
*/
for(var i in data.Buckets){
objArr[i]=new createObjArray(data.Buckets[i].Name,s3,gpId);

}
/*
for(var i in bucketArray){
objArr[i]=new createObjArray(bucketArray[i],s3,gpId);
}*/
//countObjects(objArr);
callback(null,objArr);
}

function createObjArray(bucket,s3,gpId){
this.bucket=bucket;
this.s3=s3;
this.gpId=gpId;
//totObj=totObj;

}
function filterBuckets(bucketArray,callback){

  async.filter(bucketArray,filterBucketsIterator,function(result){

    if(result){

        callback(null,result);
    }
  });

}

function filterBucketsIterator(bucket,callback){
  
 var obj1={Bucket:bucket.bucket};
    bucket.s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
       logging.logError("error"+error)

      }else{

          if(data.LocationConstraint=="ap-southeast-1"){
            callback(true);
          }   
          else{
            callback(false);
          }
      }
  });
}

function countObjects(bucketArray,callback){


	async.map(bucketArray,iterator,function(err,results){

	if(err){
		logging.logError("Error in countObjects"+err);
	}
else{

  var totObjects=0;
//	logging.logInfo("FINAL SERIES CALLACK..TOT OBJECTS ARE"+JSON.stringify(results));
  for(var i in results){
totObjects+=results[i].totObj;
var gpId=results[0].gpId;

  }
  track.saves3objcount(totObjects,new Date(),gpId);
  callback();
}

});
}

function iterator(data,callback){

	
	async.waterfall([function dummy(callback){callback(null, data.bucket,data.s3,data.gpId,0,"",new Array());} ,calculateObjects],
        function(err,result ){
        if(err){
            callback(err);
        }
        else{
        
            callback(null,result);
        }
        });
	
}

function calculateObjects(bucket,s3,gpId,totObj,keymarker,objArray,callback){
  
//	logging.logInfo("for bucket"+bucket+"total objects"+totObj);
	var obj={Bucket:bucket,KeyMarker:keymarker};
	s3.client.listObjectVersions(obj,function(err,data){
    if(err){
    }else{

      objArray= objArray.concat(data.Versions);
      if(data.IsTruncated==true){
       
        calculateObjects(bucket,s3,gpId,totObj,data.NextKeyMarker,objArray,callback);

      }else{
      
      	for(var k=0;k<objArray.length;k++){
      		if(objArray[k].Size=="0"){
      			objArray.splice(k,1);
      			k=k-1;
      		}

      	}
      //	logging.logInfo("FINAL OBJ ARRAY"+JSON.stringify(objArray));
      	//map[bucket]=objArray.length;
      	totObj+=objArray.length;
        //callback(null,map,bucket);
        logging.logInfo("FOR Bucket "+bucket+" Total Objects "+totObj);

        callback(null,new getFinalObjects(gpId,totObj));
      }
    }
  });

}
function getFinalObjects(gpId,totObj){

  this.totObj=totObj;
  this.gpId=gpId;
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
