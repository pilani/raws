var async=require('async');
var cfg =require('./config.js');
var ec2Client=require('./ec2Client.js');
var ec2Copy=require('./ec2CopyAMIAcrossRegions');
var track=require('./Tracking.js');
var logging=require('./logging.js');


function launchCopyAMIs(){

    logging.logInfo("launchCopyAMIs Called");
    var kvmap = cfg.config["ACCOUNT_KEY_COMBINATIONS"];  
    //Trigerring copy for all accounts read from config
    async.forEachSeries(Object.keys(kvmap),iterator,function(err,callback){
        var gpId=generateGroupId(Object.keys(kvmap));
        if(err)
        {
            trackProcess("finalasyncCall","error in async For Each for account" +Object.keys(kvmap)+" MESSAGE :" +err,gpId,"F");
            callback(err);
        } 
        else{
            trackProcess("finalasyncCall","final callback called",gpId,"S");
                    
       }   
    });

}
//launchCopyAMIs();
exports.launchCopyAMIs=launchCopyAMIs;

function iterator(credentials, callback){   
   var gpId=generateGroupId(credentials);
    
    async.waterfall([function dummy(callback){callback(null, credentials);} ,
        ec2Client.getSrcregEc2Client,ec2Client.getDestregEc2Client,getSecurityGroups,
        fetchAMI,sortRedundantAMIs,launchCopy],function(err,result ){
        if(err){
            trackProcess("finalWaterfallCall","error in calling async.waterfall for account "+credentials+ " MESSAGE : "+err,gpId,"F");
            callback(err);
        }
        else{
            trackProcess("finalWaterfallCall","final Iterator callback",gpId,"S");
            callback();
        }
    });
}

function getSecurityGroups(srcEC2,destEC2,account,sorce,owner,callback){

    var gpId=generateGroupId(account);
    trackProcess("fetchngLstOfSecGps","Fetching List Of security Groups for owner " +owner,gpId,"S");
    srcEC2.client.describeSecurityGroups(null,function(err,data){

        if(err){
            trackProcess("nosOfSecGpsFetchd","Error Fetching security groups for owner " +owner,gpId,"F");
          
            callback(err);
        }

        else{
           
            var secGpArr=createSecurityGroupList(data);
            trackProcess("nosOfSecGpsFetchd","Nos Of Security groups Fetched "+secGpArr.length+" for owner " 
                +owner,gpId,"S");
            callback(null, secGpArr,srcEC2,destEC2,gpId,sorce,owner);
        }   
        
    });
}


function fetchAMI(secGparray,srcEC2,destEC2,gpId,sorce,owner,callback){

    trackProcess("fetchngLstOfAMIs","Fetching List Of AMIs for owner "+owner ,gpId,"S");
    var obj1={Owners:[owner]};
    srcEC2.client.describeImages(obj1,function(error,data){
        if(error){
            trackProcess("nosOfAmisFetchd","Error in fetching AMIS for owner.."+owner,gpId,"F");
          
            callback(error);
        }

        else{
            var amiArray = createAmisList(data,secGparray);     
            trackProcess("nosOfAmisFetchd","Nos Of AMIs fetched.."+amiArray.length+" for owner "+owner,gpId,"S");
            callback(null,amiArray,srcEC2,destEC2,gpId,sorce,owner);
        }

       
    });
    
}

function launchCopy(amiArray,destEC2,gpId,sorce,owner,callback){
    var keyArray=new Array();
    for(var ami in amiArray){
        var key=new copyParameters(amiArray[ami],destEC2,gpId,sorce,owner);
        keyArray[ami]=key;
    }
    ec2Copy.launcher(keyArray,callback);
       
}


function siteMonitor(){

    track.trackFailure();
    
}

function copyParameters(amiId,destEC2,gpId,sorce,owner){

    this.amiId=amiId;
    this.destEC2=destEC2;
    this.gpId=gpId;
    this.sorce=sorce;
    this.owner=owner;

}

function sortRedundantAMIs(amiArray,srcEC2,destEC2,gpId,sorce,owner,callback){

    var obj={Owners:[owner]};
    destEC2.client.describeImages(obj,function(error,data){

        if(error){
            trackProcess("noAmisPresent","Error in describe Images in sortRedundantAMIs for owner "+owner+"MESSAGE : "+error,gpId,"F");
            callback(error);
            
        }

        else{
            if(data.Images[0]==undefined){
                    trackProcess("noAmisPresent","No AMIs present in destination region for owner"+owner+"..So copying all Final" 
                    +"AMI array to be copied "+amiArray,gpId,"S");
            }
 
             else{
                 amiArray  =  removeDuplicateAMIs(data,amiArray);
                 trackProcess("nosOfAmisToBeCopied","No Of AMIs To be copied for owner"+owner+" is "+amiArray.length+
                  "Final AMI Array.. "+amiArray,gpId,"S");     
                           
            }

           callback(null,amiArray,destEC2,gpId,sorce,owner);
        }

    });
}


function removeDuplicateAMIs(data,amiArray){
    console.log("inside remove duplicates");


    for(var ami in data.Images){
        if(data.Images[ami].Description ==undefined){
            console.log("inside ")
            ami+=1;
        }
        else{
        var str=data.Images[ami].Description;
        console.log(str);
        var desAMIID=str.split("_");
        for(var i=0;i<amiArray.length;i++){
            if(amiArray[i]==desAMIID[3]){
                amiArray.splice(i, 1);
            }
        } 
    }
  }
    if(amiArray[0]==undefined){
        
        logging.logInfo("No AMI to be copied");
        
    }

  return amiArray;      
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

    var today=new Date();
    var date=today.toDateString();
    var time=today.toTimeString();
    return date+" "+time;
}
exports.generateTimestamp=generateTimestamp;

function trackProcess(schemaAttrib, message,gpId,status){

    track.copySaveTrack(schemaAttrib,message,message,generateTimestamp(),gpId,status);
    
}

exports.trackProcess=trackProcess;