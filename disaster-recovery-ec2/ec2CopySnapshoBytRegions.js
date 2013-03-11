var ec2Client = require('./ec2Client.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var async=require('async');
var AWS=require('aws-sdk');
var ec2=require('./ec2DisasterRecovery.js');

//site monitoring

/*function iallisweell(){

select * from mongo sort by timestamp group gp id ;
if(status==error){

}
	return OK;
}

fucntion track(messge,status,trackDetails){
logging.info()
	tracktoMongo(timestamp,gpid,mesage,status);
}*/
 //track(messgae,status);


function copySnapshot(SnapshotId,destEC2,gpId,sorce,owner,callback){
	   
	var obj={SourceRegion:sorce,SourceSnapshotId:SnapshotId,Description:"Created under Disaster Recovery for SnapshotID_"+SnapshotId};

	destEC2.client.copySnapshot(obj,function(err,data){

		if(err){
			ec2.trackProcess("snapshotCopyFailure","Snapshot Copy failed because"  + err  + "For" 
				+ SnapshotId,gpId,"F");
			callback(err);
		}

		else{
			var snapID=data.SnapshotId;
          	describeSnapshots(snapID,destEC2,callback,10*000);
			ec2.trackProcess("snapShotCopySuccess","Snapshot copy initiated successfully for snapshot Id.."+SnapshotId,gpId,"S");
		
		}		
	
	});
	
}    

function launcher(snapArr,callback){

	async.forEachLimit(snapArr,3,iterator,function (err) { 

		if(err){
			ec2.trackProcess("copyFailed","Error in calling copy for" +snapArr.snapId ,snapArr.gpId,"F");
			//logging.logError("Error in calling copy" + err);
			
			callback(err);
			
		} 
		else{
			ec2.trackProcess("copyCmplt","Copy Of all snapshots is complete..Final callback",snapArr.gpId,"S");
			//logging.logInfo("Copy Of all snapshots is complete..Final callback  ,Timestamp" + new Date());
			
			callback();
		}
	});
}
	exports.launcher=launcher;

function iterator(snapArr,callback) {
 	
	copySnapshot(snapArr.snapId,snapArr.destEC2,snapArr.gpId,snapArr.sorce,snapArr.owner,callback);

}

function describeSnapshots(snapID,destEC2,interval,callback){
	
	var obj={SnapshotIds:[snapID]};

	destEC2.client.describeSnapshots(obj,function(error,data){
	if(error){
		ec2.trackProcess("copySnap","Error in describeSnapshots for snapshotID : " +snapID+" MESSAGE "+ error,snapArr.gpId,"F");
		//logging.logError("Error in describeSnapshots for snapshotID : " +snapID+" MESSAGE "+ error);
		callback(error);
	}

	else{
		logging.logInfo("The progress of copying "+snapID + " is" + data.Snapshots[0].Progress + " Timestamp : "+new Date());
		var prg=data.Snapshots[0].Progress.split("%");
		
		checkProgress(prg,snapID,destEC2,interval,callback);
		
	}
});
}


function checkProgress(progress,snapID,destEC2,interval,callback){
	if(progress[0]!=100){
			setTimeout(function(){
           	describeSnapshots(snapID,destEC2,interval,callback);
           	}, interval);
         }
	else{
		ec2.trackProcess("copySnap","Done with copying "+snapID + " so callback",snapID,"S");
 			//logging.logInfo("Done with copying "+snapID + " so callback  ,Timestamp" + new Date() );
 			
       	 	callback();
           
	}


}