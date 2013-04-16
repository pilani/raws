var ec2Client = require('./ec2Client.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var ec2=require('./ec2DisasterRecovery.js');
var async=require('async');


exports.deleteImagesBtwRegions=function deleteImagesBtwRegions(ImagesDataArray,callback){

	
async.forEachSeries(ImagesDataArray,iterator,function (err) { 

		if(err){
			ec2.trackProcess("deleteImage","Error final callback" +ImagesDataArray.amiId ,ImagesDataArray.gpId,"F");
			callback(err);
			
		} 
		else{
			ec2.trackProcess("deleteImage","successful final callback",ImagesDataArray.gpId,"S");
			callback();
		}

	});
}

function iterator(ImagesDataArray,callback) {
 	
	deleteSnapshot(ImagesDataArray.amiId,ImagesDataArray.desEc2,ImagesDataArray.gpId,ImagesDataArray.owner,callback);
	
}

function deleteSnapshot(ImageId,destEC2,gpId,owner,callback){

	var obj1={ImageId:ImageId};
	
	destEC2.client.deregisterImage(obj1,function(error,data){

		if(error){
			ec2.trackProcess("deRegisterAMI","Image Deregistration failed for owner"+owner+" beacuse" + error+" For "+ImageId,gpId,"F");
		callback(error);
		}
		else{
		
			ec2.trackProcess("deRegisterAMI","Image Deregistration succeded for owner "+owner+" For Image Id "+ImageId,gpId,"S");
			callback(null);
		}


	});


}