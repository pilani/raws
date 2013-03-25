var async=require('async');
var cfg =require('./config.js');
var ec2Client=require('./ec2Client.js');
var del=require('./ec2DeleteImagesAcrossRegions.js');
var track=require('./Tracking.js');
var logging=require('./logging.js');
var ec2=require('./ec2DisasterRecovery.js');

var d = new Date();
var dayComp = new Date();
dayComp.setDate(d.getDate()-cfg.config["deleteImgsBfrThsDay"]);
dayComp.setHours(0,0,0,0);

function launchDelete(){

	logging.logInfo("Delete Launched at"+new Date());

	var kvmap = cfg.config["ACCOUNT_KEY_COMBINATIONS"];
	
   	async.forEachSeries(Object.keys(kvmap),iterator,function(err,callback){
   		var gpId=generateGroupId(Object.keys(kvmap));
   		if (err){
   			ec2.trackProcess("finalDelAsyncCall","error in calling async ForEach for account "+Object.keys(kvmap)+" MESSAGE : "+err,gpId,"F");
   			callback(err);
   		}
   		else{
   			ec2.trackProcess("finalDelAsyncCall","final callback called",gpId,"S");
   		}	
	});

}

launchDelete();
exports.launchDelete=launchDelete;

function iterator(credentials, callback){
	var gpId=generateGroupId(credentials);

	async.waterfall([function dummy(callback){callback(null, credentials);},ec2Client.getSrcregEc2Client,ec2Client.getDestregEc2Client,
		getImages,getAMIsToDelete,callDelete],function(err,result ){
		if(err){
 			ec2.trackProcess("finalDelWaterfallCall","error in calling async.waterfall for account"+credentials+" MESSAGE : "+err,gpId,"F");
 			callback(err);
 		}
 		else{
 			ec2.trackProcess("finalDelWaterfallCall","final Iterator callback for account"+credentials,gpId,"S");
 			callback();
 		}
	});

	
}

function getImages(srcEc2,desEc2,account,sorce,owner,callback){
	
	var gpId=generateGroupId(account);
	var AMIArr=new Array();
	ec2.trackProcess("fetchngImages","Fetching Images",gpId,"S");
	var obj={Owners:[owner]};
	desEc2.client.describeImages(obj,function(error,data){
		if(error){
			ec2.trackProcess("amisFetched","Error Fetching AMIs for owner "+owner+" ERROR "+error ,gpId,"F");
			callback(error);
		}
		else{

			if(data.Images[0]==undefined){

				ec2.trackProcess("amisFetched","No AMIs present for owner"+owner,gpId,"S");
							
			}
			else{
			ec2.trackProcess("amisFetched","AMIs fetched for owner"+owner,gpId,"S");
			}
			callback(null,data,desEc2,owner,gpId);
		}

	});

}

function getAMIsToDelete(data,desEc2,owner,gpId,callback){

	var i=0;
	var AMIArray=new Array();
	var totCounter=0;   //for total number of snapshots to be deleted	
	for(var ami in data.Images){
		var startTime=data.Images[ami].Description.split("_");
		var date=convertDate(startTime);
		ec2.trackProcess("startDate","START DATE for owner "+owner+" for ImageID "+data.Images[ami].ImageId+" is "
			+ startTime,gpId,"S");
		if(dayComp > date){
			AMIArray[i]=data.Images[ami].ImageId;
			i++;
			totCounter++;
			ec2.trackProcess("deleteinitiated","delete called for owner"+owner+" for.." + data.Images[ami].ImageId ,gpId,"S");
			
		}
		
	}
		ec2.trackProcess("nosOfImagesToBeDltd","number Of Images to be deleted  " +totCounter ,gpId,"S");
		callback(null,AMIArray,desEc2,gpId,owner);
}


function callDelete(AMIArray,desEc2,gpId,owner,callback){
    var keyArray=new Array();
    for(var ami in AMIArray){
        var key=new copyParameters(AMIArray[ami],desEc2,gpId,owner);
        keyArray[ami]=key;
    }
    del.deleteImagesBtwRegions(keyArray,callback);
 }

function copyParameters(amiId,desEc2,gpId,owner){

    this.amiId=amiId;
    this.desEc2=desEc2;
    this.gpId=gpId;
    this.owner=owner;
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

function convertDate(startTime){
	var date=new Date();
	var dateArray = startTime[1].split("/");
	date.setFullYear(parseInt(dateArray[2]));
	date.setMonth(parseInt(dateArray[0])-1);  // months indexed as 0-11, substract 1
	date.setDate(parseInt(dateArray[1])); 
   return date;
}
