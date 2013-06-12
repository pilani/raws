var config = require('./config.js');
var AWS=require('aws-sdk');
var logging=require('./logging.js');

exports.getSrcS3Client = function getSrcS3Client(account,gpId,callback){

logging.logInfo("inside source S3 cleint");
		
  	var keys = getAWSKeysByAccountName(account);
  	   	
   	var srcS3=createS3Client(keys.accKey,keys.secKey);

   	callback(null,account,srcS3,gpId);
}

exports.getDestGlacierClient = function getDestGlacierClient(account,srcS3,gpId,callback){
	logging.logInfo("inside Destination S3 cleint");

	
  	var keys = getAWSKeysByAccountName(account);

  	var desGlacier=createGlacierClient(keys.accKey,keys.secKey,keys.dest);
  	
  	callback(null,srcS3,desGlacier,account,gpId);
}

function awsKeys(accKey,secKey,dest){
	
	this.accKey = accKey;
	this.secKey = secKey;
	this.dest = dest;
}

function getAWSKeysByAccountName(account){
	
    var kvmap = config.config["KEY_REGION_S3_GLACIER"];

	var val = kvmap[account][0];

	var keys = new  awsKeys(val["ak"],val["sak"],val["dest"]);
	
	return keys;
	
}

function createS3Client(accKey,secKey){

	AWS.config.update({accessKeyId : accKey, secretAccessKey : secKey});

	var s3=new AWS.S3();
	return s3;
}

function createGlacierClient(accKey,secKey,region){
	
	AWS.config.update({accessKeyId : accKey, secretAccessKey : secKey});

	AWS.config.update({region: region});

	var glacier  = new AWS.Glacier();

	logging.logInfo("AWS client created with : access key" + accKey+"SECKEy" + secKey+"region" + region);
	
    return glacier;

} 

