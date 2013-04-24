var AWS = require('aws-sdk');
var fs = require('fs');
var exec = require('child_process').exec,
    child;
    

/**
 * Don't hard-code your credentials!
 * Load them from disk or your environment instead.
 */
AWS.config.update({accessKeyId: "AKIAINB3J4KJCDTY3VOQ", secretAccessKey:"mcKbromTj0JEDMEkrTILvp4CX73mlATzLyqQq/Qt"});

// Instead, do this:
//AWS.config.loadFromPath('./home/deepikajain/node-v0.8.17/ec2/creds.json');

// Set your region for future requests.
AWS.config.update({region: 'us-east-1'});

var glacier=new AWS.Glacier();
/*var cmd="s3cmd get --recursive s3://rawstest1 awstest1";

child = exec(cmd,function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error) {
      console.log('exec error: ' + error);
    }
    else{
console.log("Run successful");

    }
});
*//*glacier.client.listVaults(null,function(error,data){
console.log(JSON.stringify(data));
//console.log(error);
});*/
//uploading archives

 //var buffer = new Buffer("welllllll");
  //buffer.write("Hello", "utf-8");

 /* var s=fs.readdirSync("/home/deepikajain/Desktop/testbucket/");
console.log("SSSSSSSS" + s);*/

/*
fs.readFile('/home/deepikajain/Desktop/testbucket/10_144688_front', function (err, data) {
  if (err){
console.log("error" + err);

  } 
  else{
  console.log("DATA" + data + "Type of data" + typeof(data));

fs.writeFile('/home/deepikajain/Desktop/testbucket/copy',data, function(err){
            if (err) {

            	console.warn(err);
            }else{


            	console.log("write succesful");
            }
            });

  var buffer = new Buffer("deepika","utf-8");
  uploadToGlacier(buffer);
 //console.log("BUFFER" + buffer);

//buffer.write("Hello", "utf-8");



function uploadToGlacier(buffer){
	console.log("BUFFER" + buffer);
var obj={vaultName:"tests3toglacier",accountId:'317993448580',archiveDescription:"testArchive5"
//checksum:"a24d5dcb59a62d925323b1fe72c665aab5f5589a3c592ce7b72c96068ca2ea9a"
,body:buffer};

glacier.client.uploadArchive(obj,function(error,data){

	if(error){
console.log(" error is :"+error);

	}else{
console.log(JSON.stringify(data));

}});
}*/
//getting vault description

/*
var obj1={vaultName:"tests3toglacier",accountId:'-'};
glacier.client.describeVault(obj1,function(error,data){

	if(error){
console.log(" error is :"+error);

	}else{
console.log(JSON.stringify(data));

}});
*/

//Inventory retrieval


var obj2={vaultName:"tests3toglacier",accountId:'317993448580',jobParameters:{Type:"inventory-retrieval"
,SNSTopic:"arn:aws:sns:us-east-1:317993448580:inventory_Retrieval"
}};
glacier.client.initiateJob(obj2,function(error,data){

	if(error){
console.log(" error is :"+error);

	}else{
console.log(JSON.stringify(data));

}});


//archive retrieval
var obj1={vaultName:"tests3toglacier",accountId:'317993448580',jobParameters:{Type:"archive-retrieval"
,SNSTopic:"arn:aws:sns:us-east-1:317993448580:inventory_Retrieval",
ArchiveId:"2iy7fuJaEductcHDQAsThNKb-yUH2P0UiNgzYMKYbrzQtkxOLLHTltfFPUi22iXlpyjfuMbvdaI4uLsmDn8DjYrNB-p-Az1Cll3ELCdEJBX0fwnWoplpZQJXT03Y9WJzl3Ltzzmu8g"
}};
glacier.client.initiateJob(obj1,function(error,data){

  if(error){
console.log(" error is :"+error);

  }else{
console.log(JSON.stringify(data));

}});

/*
var obj={accountId:'317993448580',vaultName:"tests3toglacier",jobId:"mvUfaecKXr-LI_jexN-Tg71voCBSviIjlpf9DzVsikvGx2XuNaRuFFyjd3PFRJlaM6xYVKeMNhEZnCZpmlqxBj6_myIp"};
glacier.client.getJobOutput(obj,function(err,data){

if(err){
  console.log("error" + err);
}
else{
console.log("DATA" +JSON.stringify((data.body).toString()));

}
});*/