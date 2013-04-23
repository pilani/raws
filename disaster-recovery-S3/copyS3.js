var AWS = require('aws-sdk');
var fs = require('fs');
var exec = require('child_process').exec,
    child;
var wrench=require('wrench');

var async=require('async');
var cfg=require('./config.js');
var s3Client=require('./S3Client.js');
var finder = require('findit');
//var http = require('http').createServer().listen(8080);
launchCopyS3();

function launchCopyS3(){

    console.log("copy launched");
    var kvmap = cfg.config["KEY_REGION_S3_GLACIER"];  
    async.forEachSeries(Object.keys(kvmap),iterator,function(err,callback){
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
function iterator(credentials, callback){   

    async.waterfall([function dummy(callback){callback(null, credentials);} ,s3Client.getSrcS3Client,
      s3Client.getDestGlacierClient,getBuckets,createBucketArray,bucketParams,filterBuckets,getObjectsAndUpload],
        function(err,result ){
        if(err){
           // trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
            callback(err);
        }
        else{
            //trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
            console.log("final waterfall callback");
            callback();}
        });
    }

function getBuckets(s3,desGlacier,account,callback){
  s3.client.listBuckets(null,function(error,data){
     if(error){
        console.log("error.."+error);
      }
      else{

        // console.log("DATA Returned"+JSON.stringify(data));
        callback(null,data,desGlacier,s3);
      }  
  });
}


function createBucketArray(bucketData,desGlacier,s3,callback){
  var bucketArray=new Array();

  bucketArray[0]="apacrdatakeyvaluemapsfailure";
  bucketArray[1]="317993448580-ap-northeast-1";
  bucketArray[2]="boss-ami";
  bucketArray[3]="cloudwatchscript";
  bucketArray[4]="tests3toglacier";
  callback(null,bucketArray,desGlacier,s3);
}

function bucketParams(bucketArray,desGlacier,s3,callback){
 
  var bucketParamArray=new Array();
    for(var buck in bucketArray){
      var key=new bucketParameters(bucketArray[buck],desGlacier,s3);
        bucketParamArray[buck]=key;
        //console.log("whoole obj "+JSON.stringify(bucketParamArray[buck]));
    }
    callback(null,bucketParamArray);

}

function bucketParameters(bucketName,desGlacier,s3){

  this.bucketName=bucketName;
  this.desGlacier=desGlacier;
  this.s3=s3;
}

function filterBuckets(bucketArray,callback){

  async.filter(bucketArray,filterBucketsIterator,function(result){

    if(result){
        //console.log("RESULT" + JSON.stringify(result));
        callback(null,result);
    }
  });

}

function filterBucketsIterator(bucket,callback){

 var obj1={Bucket:bucket.bucketName};
    bucket.s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
        console.log("Error"+error);
      }else{
       // console.log("DATA" + JSON.stringify(data));
          if(data.LocationConstraint=="ap-southeast-1"){
            callback(true);
          }   
          else{
            callback(false);
          }
      }
  });
}



function getObjectsAndUpload(bucketDataArray,callback){

  async.forEachSeries(bucketDataArray,readBucketData,function(err){
      
      if (err){
        
        callback(err);
      }
      else{
        console.log("getObjectsAndUpload success");
        callback();
      } 
  });

}

function readBucketData(bucketDataArray,callback){

async.waterfall([function dummy(callback){callback(null, bucketDataArray.bucketName,
  bucketDataArray.desGlacier);},
  makeDirectoryForEachBucket,getObjectsForEachBucket,getPathOfFilesInEachBucket,createUploadParams,
  readAndUpload],function(err,result){
    if(err){
      callback(err);
    }
    else{
      callback(null);
    }
  });
}

 
function makeDirectoryForEachBucket(bucketName,desGlacier,callback){

  var cmd="mkdir -p /home/deepikajain/node-v0.8.17/S3/bucket_data/"+bucketName;
  child = exec(cmd,function (error, stdout, stderr) {
      if (error) {
            console.log('exec error: ' + error);
      }
      else{
        
        callback(null,bucketName,desGlacier);
      }
  });
}

function getObjectsForEachBucket(bucketName,desGlacier,callback){
  
	var cmd="s3cmd get --recursive s3://"+bucketName+" bucket_data/"+bucketName+ "  --skip-existing";
	child = exec(cmd,function (error, stdout, stderr) {

    	if (error) {
      			console.log('exec error: ' + error);
    	}
    	else{
        var split=stdout.split("'");
   
				console.log("Run successful");
				callback(null,desGlacier,bucketName);
    	}
	});
 }


function getPathOfFilesInEachBucket(desGlacier,bucketName,callback){

  var walk    = require('walk');
  var files   = [];
  var walker  = walk.walk('/home/deepikajain/node-v0.8.17/S3/bucket_data/'+bucketName, { followLinks: false });
  walker.on('file', function(root, stat, next) {
    files.push(root + '/' + stat.name);
    next();
  });

  walker.on('end', function() {
    console.log(files);
    callback(null,files,desGlacier);
  });
 
}


function createUploadParams(pathArray,desGlacier,callback){
  console.log("PATHARRRAAAAAAAY"+pathArray);
  var uploadArray=new Array();
  for(var path in pathArray){
      var pathKey=new uploadParams(pathArray[path],desGlacier);
      uploadArray[path]=pathKey;
  }
  callback(null,uploadArray);
}



function uploadParams(path,desGlacier){

  this.path=path;
  this.desGlacier=desGlacier;

}

function readAndUpload(fromPathArray,callback){
	async.forEach(fromPathArray,uploadBucketData,function(err){
 		if (err){
 			callback(err);
 		}
 		else{
   			console.log("Read and upload success");
        callback();
 		}	
	});

}

function uploadBucketData(fromPathArray,callback) {
	async.waterfall([function dummy(callback){callback(null, fromPathArray.path,fromPathArray.desGlacier);}
    ,readFilesFromDirectory,createKey,createArchiveDesForGlacier,createMetadata,createMetadataFile,uploadToS3],
    function(err,result){
		  if(err){
 			  callback(err);
 		 }
 		 else{
 			  callback(null);
 		}
 	});
 	
}

function readFilesFromDirectory(path,desGlacier,callback){
 
  fs.readFile(path, function (err, data) {
    if (err){
      console.log("error" + err);
    } 
    else{
      //console.log("DATA" + data );
      var buffer = new Buffer(data,"utf-8");
      console.log("array before passing" + path);
      callback(null,path,buffer,desGlacier);
    }
  });
}

function createKey(path,buffer,desGlacier,callback){
  var keyArray=path.split("/");
  var len=keyArray.length;
  var key=keyArray[len-1];
  //  console.log("KEYYY" + key);
  callback(null,key,buffer,path,desGlacier);
}


function createArchiveDesForGlacier(key,buffer,path,desGlacier,callback){

  var archiveDes=path.replace(/\//gi,".");
  callback(null,key,buffer,path,desGlacier,archiveDes);

}

function createMetadata(key,buffer,path,desGlacier,archiveDes,callback){

  var metadata="ARCHIVE NAME : "+archiveDes+"PATH :" +path+"CREATION TIMESTAMP :"+new Date();
  callback(null,key,buffer,path,desGlacier,archiveDes,metadata);

}


function createMetadataFile(key,buffer,path,desGlacier,archiveDes,metadata,callback){

  var cmd="touch /home/deepikajain/node-v0.8.17/S3/bucket_data/"+key+".txt";
  //console.log("CMDDDDD" + cmd);

  child = exec(cmd,function (error, stdout, stderr) {
      if (error) {
        console.log('exec error: ' + error);
      }
      else{
        fs.writeFile("/home/deepikajain/node-v0.8.17/S3/bucket_data/"+key+".txt",metadata,function (err) {
          if (err) {
            console.log(err);
          }    
        });
        callback(null,key,buffer,desGlacier,archiveDes);
      }
  });
}

 function uploadToS3(key,buffer,desGlacier,archiveDes,callback){
 	//console.log("upload to S3 with key" + archiveDes);
  var obj={Bucket:"rawss3test",Key:archiveDes,Body:buffer}
  desGlacier.client.putObject(obj,function(error,data){
	  if(error){
		  console.log("error.."+error);
	  } 
	   else{
    //console.log("DATA Returned"+JSON.stringify(data));
      fs.appendFile("/home/deepikajain/node-v0.8.17/S3/bucket_data/"+key+".txt",JSON.stringify(data),function(err){
        if(err){
            console.log("ERROR in Appending copy data to glacier"+err)
        }else{
            console.log("data Appended successfully");
        }
      });
    }
    callback(null);
    });
}

function uploadToGlacier(key,buffer,desGlacier,archiveDes,callback){

  var obj={vaultName:"tests3toglacier",accountId:'317993448580',archiveDescription:archiveDes
  //checksum:"a24d5dcb59a62d925323b1fe72c665aab5f5589a3c592ce7b72c96068ca2ea9a"
  ,body:buffer};

  desGlacier.client.uploadArchive(obj,function(error,data){
    if(error){
      console.log(" error is :"+error);

    }else{
      console.log(JSON.stringify(data));
      fs.appendFile("/home/deepikajain/node-v0.8.17/S3/bucket_data/"+key+".txt",JSON.stringify(data),function(err){
        if(err){
            console.log("ERROR in Appending copy data to glacier"+err)
        }else{
            console.log("data Appended successfully");
        }
      });
    }
    callback(null);
  });
}

 /*function readDirectory(callback){
  console.log("inside readDirectory");

   var uploadFiles=fs.readdirSync("/home/deepikajain/node-v0.8.17/S3/rawstest1/rawstest1");
  console.log("SSSSSSSS" + uploadFiles);
  callback(null,uploadFiles);

 }*/
