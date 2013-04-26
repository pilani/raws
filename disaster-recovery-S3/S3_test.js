var AWS = require('aws-sdk');
var fs = require('fs');

/**
 * Don't hard-code your credentials!
 * Load them from disk or your environment instead.
 */
AWS.config.update({accessKeyId: "AKIAJR3PUPPHPYB37LNA", secretAccessKey:"qHXLN7va+27PAuMRlsLgxKr4Rh8iVCM8BxzLzX7D"});

// Instead, do this:
//AWS.config.loadFromPath('./home/deepikajain/node-v0.8.17/ec2/creds.json');

// Set your region for future requests.
AWS.config.update({region: 'us-east-1'});
//var buff=new Buffer();

var s3 = new AWS.S3();
/*var filepath="/home/deepikajain/Desktop/testbucket/default.txt";
var obj={Bucket:'rawss3test',Key:"Learning.txt"};
s3.client.getObject(obj,function(error,data){
	if(error){
		console.log("error.."+error);
	}
	else{
		//console.log(JSON.stringify(data.Body));
		//var buff=new Buffer(1256);
		//buff.write(JSON.stringify(data.Body));
		fs.writeFile(filepath,data.Body, function(err){
            if (err) {

            	console.warn(err);
            }else{


            	console.log("write succesful");
            }
            });
		var buff=data.Body;
		console.log(".."+Buffer.isBuffer(buff));
		console.log("buff"+buff.toString());
	}
	});


fs.readFile('/home/deepikajain/Desktop/testbucket/10_144688_front', function (err, data) {
  if (err){
console.log("error" + err);

  } 
  else{
  //console.log("DATA" + data + "Type of data" + typeof(data));}

  var buffer = new Buffer(data,"utf-8");
  uploadToS3(buffer);
 console.log("BUFFER" + buffer);

//buffer.write("Hello", "utf-8");
  }
});
function uploadToS3(buffer){
var obj={Bucket:"rawss3test",Key:"something",Body:buffer}
s3.client.putObject(obj,function(error,data){
	if(error){
		console.log("error.."+error);
	}
	else{

console.log("DATA Returned"+data);

}
});


	}

var date=new Date();
var today=new Date();

var lastMonth=new Date();
lastMonth.setMonth(date.getMonth()-1);
//lastMonth.setYear(date.getFullYear()-1);
//today.setYear(date.getFullYear()-1);

console.log(today + "    "+ lastMonth );

var bucketArray=new Array();
s3.client.listBuckets(null,function(error,data){
	if(error){
		console.log("error.."+error);}
		else{
//console.log("list of buckets"+JSON.stringify(data));
for (var i in data.Buckets){

	console.log(data.Buckets[i].Name);
	bucketArray[i]=data.Buckets[i].Name;

}
console.log("bucket array" + bucketArray);
keymarker="";
for(var j in bucketArray ){
	console.log("BUCKET NAME..........."+bucketArray[j]);
getObjects(keymarker,bucketArray[j]);

}
}
});



var totalObjects=0;
var counter=0;
*/
getObjects("","lis-bpimages")
var objectArray=new Array();
var objectArray1=new Array();
function getObjects(keymarker,bucketname){

var obj1={Bucket:bucketname,Delimiter:'/*',MaxKeys:1
,KeyMarker:keymarker};
console.log("bucketname" + bucketname);

s3.client.listObjectVersions(obj1,function(error,data){
	if(error){
		console.log("error.."+error);}
		else{
			//objectArray.push(data.Versions);
		objectArray1=	objectArray1.concat(data.Versions);
//console.log("Object  data"+JSON.stringify(data));
/*
for(var k in data.Versions){

	//console.log("last modified" + data.Versions[k].LastModified+"for   " + data.Versions[k].Key);
	var lastModified=data.Versions[k].LastModified;
	console.log("..........."+lastModified+"          "+data.Versions[k].Key);
	//lastModified.setMonth(lastModified.getMonth()-1);
	lastModified.setYear(lastModified.getFullYear()+1);

	//console.log("..........."+lastModified);

	if(lastModified>lastMonth && lastModified<today){
		counter++;
		console.log("inside IFF");
console.log("LAST MODIFIED......."+lastModified+"for" + data.Versions[k].Key);
}}
//console.log("is Truncated"+data.IsTruncated);
//console.log("data length"+data.Versions.length);
totalObjects+=data.Versions.length;
*/
if(data.IsTruncated==true){
	//var objectArray=new Array();
	//objectArray.push(data);
	//console.log("inside if");
	//console.log("Next marker"+data.NextKeyMarker);
	//objectArray1=	objectArray.concat(data);
	getObjects(data.NextKeyMarker,bucketname);
}
}
console.log("OBJECTARRAY!!!!!!!!!!!"+JSON.stringify(objectArray1));
}); 

//console.log("total objects modified last month" + counter);

//console.log("total objects"+totalObjects);

}
