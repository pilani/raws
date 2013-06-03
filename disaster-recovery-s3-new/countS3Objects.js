var AWS = require('aws-sdk');
var fs = require('fs');
var async=require('async');
var cfg=require('./config.js');
var s3Client=require('./S3Client.js');
var track=require('./Tracking.js');


//launchS3CountA();

exports.launchS3Count=function launchS3Count(){

	//logic of counting

	setTimeout(launchS3CountA,1000*60*60);
}

function launchS3CountA(){

    console.log("launchS3Count launched");
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
      s3Client.getDestGlacierClient,getListOfBuckets,createArray,countObjects],
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
	console.log("inside createArray....");
	var bucketArray=new Array();
	var objArr=new Array();
/*bucketArray[0]="apacrdatakeyvaluemapsfailure";
bucketArray[1]="317993448580-ap-northeast-1";
bucketArray[2]="cv-log-99586e526342f5f0dd4cebfd8bdf7b2b";
bucketArray[3]="cloudwatchscript";
bucketArray[4]="tests3toglacier";*/

for(var i in data.Buckets){
bucketArray[i]=new createObjArray(data.Buckets[i].Name,s3,gpId);

}/*
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


function countObjects(bucketArray,callback){
	console.log("inside countObjects....");

	async.map(bucketArray,iterator,function(err,results){

	if(err){
		console.log(err)
	}
else{
	//callback();
  var totObjects=0;
	console.log("FINAL SERIES CALLACK..TOT OBJECTS ARE"+JSON.stringify(results));
  for(var i in results){
totObjects+=results[i].b;
var gpId=results[0].a;

  }
  track.saves3objcount(totObjects,new Date(),gpId);
  console.log("totObjects"+totObjects);
  callback();
}

});
}

function iterator(data,callback){

	console.log("DATA in iterator");
	async.waterfall([function dummy(callback){callback(null, data.bucket,data.s3,data.gpId,0,"",new Array());} ,calculateObjects],
        function(err,result ){
        if(err){
            callback(err);
        }
        else{
          console.log("in iterator"+result);
            callback(null,result);
        }
        });
	
}

function calculateObjects(bucket,s3,gpId,totObj,keymarker,objArray,callback){
  
	console.log("for bucket"+bucket+"total objects"+totObj);
	var obj={Bucket:bucket,KeyMarker:keymarker};
	s3.client.listObjectVersions(obj,function(err,data){
    if(err){
    }else{

      objArray= objArray.concat(data.Versions);
      if(data.IsTruncated==true){
        console.log("inside truncated true");
        calculateObjects(bucket,s3,gpId,totObj,data.NextKeyMarker,objArray,callback);

      }else{
      	//console.log("OBJ ARRAY"+JSON.stringify(objArray));
      	for(var k=0;k<objArray.length;k++){
      		if(objArray[k].Size=="0"){
      			objArray.splice(k,1);
      			k=k-1;
      		}

      	}
      	console.log("FINAL OBJ ARRAY"+JSON.stringify(objArray));
      	//map[bucket]=objArray.length;
      	totObj+=objArray.length;
        //callback(null,map,bucket);
        console.log("Total Objects"+totObj);

        callback(null,new abc(gpId,totObj));
      }
    }
  });

}
function abc(a,b){

  this.a=a;
  this.b=b;
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