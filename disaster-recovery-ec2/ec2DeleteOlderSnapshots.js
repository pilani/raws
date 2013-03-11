var async=require('async');
var cfg =require('./config.js');
var ec2Client=require('./ec2Client.js');
var del=require('./ec2DeleteSnapshotRegions.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var ec2=require('./ec2DisasterRecovery.js');

var d = new Date();

function launchDelete(){

	logging.logInfo("Delete Launched at"+new Date());

	var kvmap = cfg.config["ACCOUNT_KEY_COMBINATIONS"];
	
   	async.forEachSeries(Object.keys(kvmap),iterator,function(err){
   		if (err){
   			trackProcess("finalDelAsyncCall","error in calling async ForEach for account "+Object.keys(kvmap)+" MESSAGE : "+err,gpId,"F");
   		}
   		else{

   			trackProcess("finalasyncCall","final callback called",gpId,"S");
   		}	
	});

}

launchDelete();
exports.launchDelete=launchDelete;

function iterator(credentials, callback){

	async.waterfall([function dummy(callback){callback(null, credentials);},ec2Client.getSrcregEc2Client,ec2Client.getDestregEc2Client,getSnapshots,getSnapshotsToDelete],function(err,result ){
		if(err){
 		trackProcess("finalWaterfallCall","error in calling async.waterfall for account MESSAGE : "+err,gpId,"F");
 		}
 		else{
 		trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
 		}
	});

	callback();
}

function getSnapshots(srcEc2,desEc2,account,callback){
	
	var gpId=generateGroupId(account);
	trackProcess("fetchngSnapshots","Fetching Snapshots",gpId,"S");
	var obj={OwnerIds:cfg.config["OWNERS"]};
	desEc2.client.describeSnapshots(obj,function(error,data){
		if(error){
			trackProcess("snapsFetched","Error Fetching security groups",gpId,"F");
			callback(err);
		}
		else{

			trackProcess("snapsFetched","Snapshots fetched for account"+account,gpId,"S");
			callback(null,data,desEc2,account,gpId);
		}

	});

}

function getSnapshotsToDelete(data,destEC2,account,gpId,callback){

	var totCounter=0;   //for total number of snapshots to be deleted	
	for(var snap in data.Snapshots){
	trackProcess("startTime","START TIME for snapID"+data.Snapshots[snap].SnapshotId+"is"+ data.Snapshots[snap].StartTime 
			 ,gpId,"S");

		if(data.Snapshots[snap].StartTime < d){

			totCounter++;
			trackProcess("deleteinitiated","deleteSnapshot called for.." + data.Snapshots[snap].SnapshotId ,gpId,"S");

			

			del.deleteSnapshotBtwRegions(data.Snapshots[snap].SnapshotId,destEC2,gpId);
			
			

		}

	

	new track.trackDelete({nosOfSnapshotsToBeDltd:totCounter,groupId:gpId}).save(function(err,result){

		track.saveTracker(err,result);

	});
  
	

	callback();
}

function generateGroupId(account){
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

return account+"_"+today;

}
/*console.log("before:" + d);
//d.setMonth(d.getMonth()+1);
//d.setDate(d.getDate()-1);
console.log("After" + d);*/