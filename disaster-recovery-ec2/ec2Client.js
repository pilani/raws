var config = require('./config.js');
var AWS=require('aws-sdk');

exports.getSrcregEc2Client = function getSrcregEc2Client(account,callback){
		
  	var keys = getAWSKeysByAccountName(account);
  	   	
   	var srcEc2=createAWSClient(keys.accKey,keys.secKey,keys.sorce);

   	var sorce=keys.sorce;
  	
  	var owner=keys.owner;

  	callback(null,account,srcEc2,sorce,owner);
}

exports.getDestregEc2Client = function getDestregEc2Client(account,srcEc2,sorce,owner,callback){
	
  	var keys = getAWSKeysByAccountName(account);

  	var desEc2=createAWSClient(keys.accKey,keys.secKey,keys.dest);
  	
  	callback(null,srcEc2,desEc2,account,sorce,owner);
}

function awsKeys(accKey,secKey,sorce,dest,accnum,owner){
	
	this.accKey = accKey;
	this.secKey = secKey;
	this.sorce = sorce;
	this.dest = dest;
	this.accnum = accnum;
	this.owner=owner;
}

function getAWSKeysByAccountName(account){
	
    var kvmap = config.config["ACCOUNT_KEY_COMBINATIONS"];

	var val = kvmap[account][0];

	var keys = new  awsKeys(val["ak"],val["sak"],val["sorce"],val["dest"],val["accountName"],val["owner"]);
	
	return keys;
	
}


function createAWSClient(accKey,secKey,region){
	
	AWS.config.update({accessKeyId : accKey, secretAccessKey : secKey});

	AWS.config.update({region: region});

	var EC2  = new AWS.EC2();

	console.log("AWS client created with : access key" + accKey+"SECKEy" + secKey+"region" + region);
	
    return EC2;

} 