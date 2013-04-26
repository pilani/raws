var mongoose = require('mongoose');
//var logging=require('./logging.js');
  
  mongoose.connect('mongodb://localhost/s3db');

  var DB=mongoose.connection;
  DB.on('error',console.error.bind(console,'connection error'));
  DB.once('open', function callback(){

  	console.log("connection successfull");
    //logging.logInfo("connection successfull");

  });

  var S3MetadataSchema = mongoose.Schema({
    ObjectName:String,
    CreationDate:Date
});
  

  var trackS3Metadata = mongoose.model('savemetadata',S3MetadataSchema);
  exports.trackS3Metadata=trackS3Metadata;

exports.saveS3MetadataToMongo=function saveS3MetadataToMongo(ObjectName,creationDate){

var trackMetadata = new trackS3Metadata({});
trackMetadata.setValue("ObjectName",ObjectName);
trackMetadata.setValue("CreationDate",creationDate);
trackMetadata.save(function(err,result){

         saveTracker(err,result);

    });
}


function saveTracker(err,result){
    
    if(err){
    
       // logging.logError("ERROR in saving to mongo Db"+err);
    }
    else{
       // console.log("RESULT" + result);
    }
}