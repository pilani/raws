var ec2Client = require('./ec2Client.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var async=require('async');
var AWS=require('aws-sdk');
var ec2=require('./ec2DisasterRecovery.js');



function copyAMI(amiId,destEC2,gpId,sorce,owner,callback){

	var date=createDateForDescription();

	var obj={SourceRegion:sorce,SourceImageId:amiId,Name:amiId+"_Copy",Description:"Created under disaster recovery on_"+ createDateForDescription()+"_for AMIID_"+amiId};

	destEC2.client.copyImage(obj,function(err,data){

		if(err){
			ec2.trackProcess("AMICopyFailure","AMI Copy for owner"+owner+" failed because"  + err  + "For" 
				+ amiId,gpId,"F");
			callback(err);
		}

		else{
			var copiedImageId=data.ImageId;
          	ec2.trackProcess("AMICopySuccess","AMI copy for owner "+owner+"  initiated successfully for ImageId.."+amiId,gpId,"S");
			describeAMIs(copiedImageId,destEC2,10*000,gpId,callback);
			
		}		
	
	});
	
}    

function launcher(amiArray,callback){
	async.forEach(amiArray,iterator,function (err) { 

		if(err){
			ec2.trackProcess("copyCmplt","Error in calling copy for" +amiArray.amiId ,amiArray.gpId,"F");
			callback(err);
			
		} 
		else{
			ec2.trackProcess("copyCmplt","Copy Of all AMIs is complete..Final callback",amiArray.amiId,"S");
			callback();
		}

	});
}
	exports.launcher=launcher;

function iterator(amiArray,callback) {
 	
	copyAMI(amiArray.amiId,amiArray.destEC2,amiArray.gpId,amiArray.sorce,amiArray.owner,callback);
	
}

function describeAMIs(copiedImageId,destEC2,interval,gpId,callback){
	
	var obj={ImageIds:[copiedImageId]};
	destEC2.client.describeImages(obj,function(error,data){
		if(error){
			ec2.trackProcess("copyAmi","Error in describeImages for groupID " +gpId+" for AMI_ID : " +copiedImageId+" MESSAGE "+ error,gpId,"F");
			callback(error);
		}

		else{
			logging.logInfo("The progress of copying "+copiedImageId + " is" + data.Images[0].State + " Timestamp : "+new Date());
			var state=data.Images[0].State;
			checkProgress(state,copiedImageId,destEC2,interval,gpId,callback);
		
		}
	});
}


function checkProgress(state,copiedImageId,destEC2,interval,gpId,callback){

	if(state!="available"){
		setTimeout(function(){
        describeAMIs(copiedImageId,destEC2,interval,gpId,callback);
        }, interval);
    }
	else{
		ec2.trackProcess("copyAmi","Done with copying "+copiedImageId + "for GroupId"+gpId+" so callback",gpId,"S");
 		callback(null);
           
	}

}

function createDateForDescription(){

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
    return today;
}