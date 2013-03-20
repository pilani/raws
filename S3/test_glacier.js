var AWS = require('aws-sdk');

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



/*glacier.client.listVaults(null,function(error,data){
console.log(JSON.stringify(data));
//console.log(error);
});*/

 var buffer = new Buffer("welllllll");
buffer.write("Hello", "utf-8");

var obj={vaultName:"testVault",accountId:'317993448580',archiveDescription:"testArchive3",
//checksum:"924d88a8fc36f08d6efbabeaed082b1a868dfa1da18a792aa59626ab5c5a0efc"
body:buffer};

glacier.client.uploadArchive(obj,function(error,data){

	if(error){
console.log(" error is :"+error);

	}else{
console.log(JSON.stringify(data));

}});


/*

var obj1={vaultName:"testVault",accountId:'-'};
glacier.client.describeVault(obj1,function(error,data){

	if(error){
console.log(" error is :"+error);

	}else{
console.log(JSON.stringify(data));

}});
*/