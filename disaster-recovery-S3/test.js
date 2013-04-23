var cfg =require('./config.js');
var AWS = require('aws-sdk');
var fs = require('fs');
var wrench=require('wrench');

var async=require('async');
var walk    = require('walk');


var kvmap = cfg.config["KEY_REGION_S3_GLACIER"];



console.log("kvmap" + Object.keys(kvmap)+"length" + kvmap["redbus"].length);
AWS.config.update({accessKeyId: "AKIAI2OVFPB7PMETSWJA", secretAccessKey:"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"});
AWS.config.update({region: 'ap-southeast-1'});

var s3=new AWS.S3();
//getBuckets();

function getBuckets(){
  //var obj={Bucket:"317993448580-ap-northeast-1"};
    s3.client.listBuckets(null,function(error,data){
      if(error){
        console.log("error.."+error);
      }
      else{

     // console.log("DATA Returned"+JSON.stringify(data));
      //callback(null,data,desGlacier);
//segregateBucketData(data);

      }  
    });}

/*
function segregateBucketData(bucketData){
  var bucketArray=new Array();
  var j=0;
  for(var buck in bucketData.Buckets){
    console.log("bucket name passed" + bucketData.Buckets[buck].Name);
    var obj1={Bucket:bucketData.Buckets[buck].Name};
    s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
        console.log("Errior");
      }else{

        console.log("DATA" + JSON.stringify(data));

        if(data.LocationConstraint=="ap-southeast-1"){
            bucketArray[j]=bucketData.Buckets[buck].Name;
            console.log(bucketArray + "bucketname" + bucketData.Buckets[buck].Name);
            j++;

        }
        else{

          console.log("The bucket is not in singapore region  "+bucketData.Buckets[buck].Name);
        }
      }


    });

  }
  console.log(",,,,,,,,,,,"+bucketArray);
}*/
var bucketArray=new Array();

bucketArray[0]="apacrdatakeyvaluemapsfailure";
bucketArray[1]="317993448580-ap-northeast-1";
bucketArray[2]="boss-ami";
bucketArray[3]="cloudwatchscript";


//waterFall(bucketArray);

function waterFall(bucketArray){
async.waterfall([function dummy(callback){callback(null, bucketArray);}, checkSome,somerandomfunc],
        function(err,result ){
        if(err){
           // trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
            callback(err);
        }
        else{
            //trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
            console.log("final waterfall callback");
           // callback();
         }
        });
    }

 //checkSome(bucketArray);



function checkSome(bucketArray,callback){

  async.filter(bucketArray,iterator,function(result){

if(result){
  console.log("RESULT" + result);
  callback(null,result)
}
  });
}

function iterator(bucket,callback){
  console.log("inside iterator...bucket " + bucket);

 var obj1={Bucket:bucket};
    s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
        console.log("Errior");
      }else{

        console.log("DATA" + JSON.stringify(data));

        if(data.LocationConstraint=="ap-southeast-1"){
           console.log("yipppppppppppiiiiiiiieeeeeaa");
           callback(true);
           //callback(null,bucket);
        }
        else{
          console.log("The bucket is not in singapore region  ");
         callback(false);
        }
       // callback(null,bucket);
      }
  });
}

function somerandomfunc(bucket,callback){

console.log("bucket" + bucket);
callback(null);
}
/*function getBuckets(){
  var obj={Bucket:"apacrdatakeyvaluemapsfailure"};
    s3.client.getBucketLocation(obj,function(error,data){
      if(error){
        console.log("error.."+error);
      }
      else{

      console.log("DATA Returned"+JSON.stringify(data));
     // callback(null,data,desGlacier);
      }  
    });
}*/

function segregateBucketData(bucketData,desGlacier,s3,callback){
  var bucketArray=new Array();
  var j=0;
  for(var buck in bucketData.Buckets){
    var obj1={Bucket:bucketData.Buckets[buck].Name};
    s3.client.getBucketLocation(obj1,function(error,data){
      if(error){
        console.log("Errior");
      }else{

        console.log("DATA" + JSON.stringify(data));

        if(data.LocationConstraint=="ap-southeast-1"){
            bucketArray[j]=bucketData.Buckets[buck].Name;
            j++;

        }
        else{

          console.log("The bucket is not in singapore region");
        }
        callback(null,bucketArray,desGlacier);
      }
    });
  }
}

function getDirectoryFiles(directory, desGlacier,pathArray,callback) {
  console.log("for direcory "+directory);
  fs.readdir(directory, function(err, files) {

    files.forEach(function(file){
      fs.stat(directory + '/' + file, function(err, stats) {
        if(stats.isFile()) {
          pathArray.push(directory + '/' + file);
          console.log("patharray"+pathArray);
          
        }
        if(stats.isDirectory()) {
          getDirectoryFiles(directory + '/' + file, desGlacier,pathArray,callback);
        }
      });

    });

   callback(null,pathArray,desGlacier); 
 
  });
}

function readFiles(desGlacier,bucketName,callback){
  console.log("am i called");
  var pathArray=new Array();
  var directory="/home/deepikajain/node-v0.8.17/S3/bucket_data/"+bucketName;
 callback(null,directory,desGlacier,pathArray);
}

function createPath(read,desGlacier,callback){
var pathArray=new Array();
var j=0;
  for(var i in read){

      if(i%2!=0){
          pathArray[j]=split[i];
          j++;}
      }
     console.log("pathArray"+pathArray);   
        callback(null,pathArray,desGlacier);
}
var path="home/deepika/node/code/bucket/ticket.jpeg";

//createKey(path);
function createKey(path){
  var key="";
    var keyArray=path.split("/");
    var len=keyArray.length;
    for(var p=0;p<len;p++){

     key=keyArray[p];
     key+=KeyArray[p+1];
  }

  var key=path.replace(/\//gi,".");
  console.log("KEYYY" + key);
   

}

//readFiles();

//readDirectory();
function readDirectory(){
  console.log("inside readDirectory");

   /*var uploadFiles=fs.readdirSync("/home/deepikajain/node-v0.8.17/S3/bucket_data");
  console.log("SSSSSSSS" + uploadFiles);*/

 fs.readdir("/home/deepikajain/node-v0.8.17/S3/bucket_data",function(err,files){
console.log("kdjoierwjfijweq'dk.........."+files)

 });
}
/*
getDirectoryFiles("/home/deepikajain/node-v0.8.17/S3/bucket_data/tests3toglacier");
function getDirectoryFiles(directory,callback) {
  var pathArray=new Array();
  fs.readdir(directory, function(err, files) {
    files.forEach(function(file){
      fs.stat(directory + '/' + file, function(err, stats) {
        if(stats.isFile()) {
          pathArray.push(directory + '/' + file);
            //callback(directory + '/' + file);
            console.log(pathArray);
         

        }
        if(stats.isDirectory()) {
          getDirectoryFiles(directory + '/' + file);
        }
      });
    });
    callback(null,pathArray);
  });
  //console.log("pathArray"+pathArray);
}*/
/*function readFiles(){
  var pathArray=new Array();
  var i=0;
getDirectoryFiles("/home/deepikajain/node-v0.8.17/S3/bucket_data/tests3toglacier", function(file_with_path) {
  console.log(file_with_path);
  pathArray.push(file_with_path);
  console.log("patharray"+ pathArray);
  //i++;

});
console.log("........"+pathArray)
}*/


//readUsingWalk();
function readUsingWalk(){

  var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('/home/deepikajain/node-v0.8.17/S3/bucket_data/tests3toglacier', { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    files.push(root + '/' + stat.name);
    next();
});

walker.on('end', function() {
    console.log(files);
});
}

readUsingFindit();


function readUsingFindit(){


  var finder = require('findit').find("/home/deepikajain/node-v0.8.17/S3/bucket_data/tests3toglacier");

finder.on('dir', function (dir, stat) {
    console.log("DIRECTORY"+dir + '/');
});

finder.on('file', function (file, stat) {
    console.log("FILES"+file);
});

finder.on('link', function (link, stat) {
    console.log("LINKS"+link);
});
}
