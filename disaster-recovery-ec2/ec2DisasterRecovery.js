var async=require('async');
var cfg =require('./config.js');
var ec2Client=require('./ec2Client.js');
var ec2Copy=require('./ec2CopySnapshotRegions');
var track=require('./Tracking.js');
var logging=require('./logging.js');


function launchCopySnapShots(){

    logging.logInfo("launchCopysnapshotsCalled");
    var kvmap = cfg.config["ACCOUNT_KEY_COMBINATIONS"]  
    //Trigerring copy for all accounts read from config
    async.forEachSeries(Object.keys(kvmap),iterator,function(err,callback){
        var gpId=generateGroupId(Object.keys(kvmap));
        if(err)
        {
            trackProcess("finalasyncCall","error in async For Each for account" +Object.keys(kvmap)+" MESSAGE :" +err,gpId,"F");
             siteMonitor();
             callback(err);
        } 
        else{
             trackProcess("finalasyncCall","final callback called",gpId,"S");
             setTimeout(function(){siteMonitor();},30*000);
                     
       }   
    });

}
launchCopySnapShots();
exports.launchCopySnapShots=launchCopySnapShots;

function iterator(credentials, callback){   
   var gpId=generateGroupId(credentials);
    
    async.waterfall([function dummy(callback){callback(null, credentials);} ,
        ec2Client.getSrcregEc2Client,ec2Client.getDestregEc2Client,getSecurityGroups,
        fetchAMI,fetchSnapshots,
        sortRedundantSnaps,launchCopy],function(err,result ){
        if(err){
            trackProcess("finalWaterfallCall","error in calling async.waterfall for account MESSAGE : "+err,gpId,"F");
           
            callback(err);
        }
            else{
                 trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
                console.log("iterator callback");
                callback();
            }
    });
}

function getSecurityGroups(srcEC2,destEC2,account,sorce,owner,callback){

    var gpId=generateGroupId(account);
    trackProcess("fetchngLstOfSecGps","Fetching List Of security Groups",gpId,"S");
    srcEC2.client.describeSecurityGroups(null,function(err,data){

        if(err){
            trackProcess("nosOfSecGpsFetchd","Error Fetching security groups",gpId,"F");
          
            callback(err);
        }

        else{
           
            var secGpArr=createSecurityGroupList(data);
            trackProcess("nosOfSecGpsFetchd","Nos Of Security groups Fetched"+secGpArr.length,gpId,"F");
            callback(null, secGpArr,srcEC2,destEC2,gpId,sorce,owner);
        }   
        
    });
}


function fetchAMI(secGparray,srcEC2,destEC2,gpId,sorce,owner,callback){

    trackProcess("fetchngLstOfAMIs","Fetching List Of AMIs",gpId,"S");
    var obj1={Owners:[owner]};
    srcEC2.client.describeImages(obj1,function(error,data){
        if(error){
            trackProcess("nosOfAmisFetchd","Error in fetching AMIS for owner.."+owner,gpId,"F");
          
            callback(error);
        }

        else{
            var amiArray = createAmisList(data,secGparray);     
            trackProcess("nosOfAmisFetchd","Nos Of AMIs fetched.."+amiArray.length,gpId,"F");
        }

        callback(null,amiArray,srcEC2,destEC2,gpId,sorce,owner);
    });
    
}


function fetchSnapshots(amiArray,srcEC2,destEC2,gpId,sorce,owner,callback){
         
    trackProcess("fetchngLstOfSnpshts","Fetching list of snapshots",gpId,"S");
    var obj={OwnerIds:[owner]};
    srcEC2.client.describeSnapshots(obj,function(error,data){

        if(error){
            trackProcess("nosOfSnpshotsFetchd","Error in Fetching Snapshots for owner.. "+owner,gpId,"F");
            
            callback(error);
        }
    
       var snapArr=createSnapshotList(data,amiArray);
       trackProcess("nosOfSnpshotsFetchd","Nos Of Snapshots fetched.." +snapArr.length,gpId,"S"); 
       callback(null,snapArr,destEC2,gpId,sorce,owner);
        
    });
}


function launchCopy(snapArr,destEC2,gpId,sorce,owner,callback){

    var keyArray=new Array();
    for(var snap in snapArr){
        var key=new copyParameters(snapArr[snap],destEC2,gpId,sorce,owner);
        keyArray[snap]=key;
    }
    ec2Copy.launcher(keyArray,callback);
   
}


function siteMonitor(){

    track.trackFailure();
    
}

function copyParameters(snapId,destEC2,gpId,sorce,owner){

    this.snapId=snapId;
    this.destEC2=destEC2;
    this.gpId=gpId;
    this.sorce=sorce;
    this.owner=owner;

}


function sortRedundantSnaps(snapArr,destEC2,gpId,sorce,owner,callback){

    var obj={OwnerIds:[owner]};
    destEC2.client.describeSnapshots(obj,function(error,data){

        if(error){
            trackProcess("noSnapsPresent","Error in describe snapshots in sortRedundantSnaps for owner "+owner+"MESSAGE : "+error,gpId,"F");
          
            callback(error);
            
        }

        else{
            if(data.Snapshots[0]==undefined){
                    trackProcess("noSnapsPresent","No Snapshots present in destination region..So copying all Final" 
                    +"Snapshot array to be copied "+snapArr,gpId,"S");
            }
 
             else{
                 snapArr  =  removeDuplicateSnaps(data,snapArr);
                 trackProcess("nosOfSnapsToBeCopied","No Of Snapshots To be copied.." +snapArr.length+
                  "Final Snapshot Array.. "+snapArr,gpId,"S");     
                           
            }

           callback(null,snapArr,destEC2,gpId,sorce,owner);
        }

    });
}


function removeDuplicateSnaps(data,snapArr,callback){

    for(var snap in data.Snapshots){
        var str=data.Snapshots[snap].Description;
        var desSnapID=str.split("_");
        for(var i=0;i<snapArr.length;i++){
            if(snapArr[i]==desSnapID[1]){
                snapArr.splice(i, 1);
            }
        } 
    }
  
    if(snapArr[0]==undefined){
        
        logging.logInfo("No snapshots to be copied");
        
    }

  return snapArr;      
}


function createSecurityGroupList(secGpData){

   var secGpArray=new Array();

    for(var secGp in secGpData.SecurityGroups){
        secGpArray[secGp]=secGpData.SecurityGroups[secGp].GroupName;
    }
    return secGpArray;  
}


function createAmisList(amiDescription,securityGpList){

    var amiArray=new Array();
    var j=0;
    for(var ami in amiDescription.Images){
       
        var str=amiDescription.Images[ami].Name;
        var amiId=amiDescription.Images[ami].ImageId;

        var n=str.split("_");
        for(var i=0;i<securityGpList.length;i++){

            if(n[0]==securityGpList[i]){
                    
                amiArray[j]=amiId;

                j++;
            }
        }
    }

    return amiArray;

}


function createSnapshotList(snapshotDescription,AmiList){
    var snapshotArray=new Array();
    var l=0;

    for(var snap in snapshotDescription.Snapshots){
        var str=snapshotDescription.Snapshots[snap].Description;
        var spl=str.split(" ");

        for(var i=0;i<AmiList.length;i++){
            if(spl[4]==AmiList[i]){
                snapshotArray[l]=snapshotDescription.Snapshots[snap].SnapshotId;
                l++;
            }
        }
   
    }

    return snapshotArray;
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

function generateTimestamp(){

    var today = new Date();
    var date=today.toDateString();
    var time=today.toTimeString();
    today=date + "  " + time;
    return today;

}

function trackProcess(schemaAttrib, message,gpId,status){

    track.copySaveTrack(schemaAttrib, message,new Date(),gpId,status);
}

exports.trackProcess=trackProcess;