var ec2Client = require('./ec2Client.js');
var cfg =require('./config.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');


exports.deleteSnapshotBtwRegions=function deleteSnapshotBtwRegions(snapshotId,destEC2,gpId){

	logging.logInfo("Delete function called at"+ new Date());

	var obj1={SnapshotId:[snapshotId]};
	
	destEC2.client.deleteSnapshot(obj1,function(error,data){

		if(error){

			console.log("ERROR" + JSON.stringify(error));
			logging.logError("Error in deleteing snapshots"JSON.stringify(error));
		
			new track.trackDelete({snapShotDltFailed:"Snapshot delete failed beacuse" + error+" For "+snapshotId,groupId:gpId}).save(function(err,result){

				track.saveTracker(err,result);

			});

		}
		else{
		
			
			console.log("DATA" +JSON.stringify(data));
			logging.logInfo("Data of Delete Snapshots"+JSON.stringify(data));
		
   			new track.trackDelete({snapshotDltSuccess:"Snapshot delete succeded For snapshot Id "+snapshotId ,groupId:gpId}).save(function(err,result){

				track.saveTracker(err,result);

			});		
		}


	});


}