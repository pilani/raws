var fmt = require('fmt');
var mongoose = require ("mongoose");

var cfg=require('../config/ec2_config.js').cfg;
//var test=require('../tests/tests.js');
var async = require('async');


console.log("adas");
mongoose.connect('mongodb://'+cfg["MONGO_HOST"]+'/'+cfg["DB_NAME"],function(err){
    if(err){
        logit("error in connecting to mongo"+err.stack);
    }else { logit (" connection to mongo succesfull");}
});
console.log("here");


Schema = mongoose.Schema; 

//Schema for Policy
var PolicySchema = new Schema({
  dbSecGpName: String,
  ipexempted: String
   
});
//Schema for exempted IP List
var InputSchema = new Schema({
  ipToBeExempted: String,
  expiry_date: Date,
  user: String,
  created_date : Date,
  secGroup : String
  
});

mongoose.model('Message', InputSchema); 
var Message = mongoose.model('Message'); 

mongoose.model('Policy', PolicySchema); 
var Policy = mongoose.model('Policy');

exports.getDbSecurityPolicies = function getDbSecurityPolicies(callback){

getPolicy(callback);

}

exports.getDbSecurityMessages= function getDbSecurityMessages(secPol,callback){

getMessages(secPol,callback);

}

exports.postDbSecurityMessages = function postDbSecurityMessages(Ip, ex_date, User, SecGp)
{
 return postMessage(Ip, ex_date, User, SecGp);
}

exports.postDbSecurityPolicy = function postDbSecurityPolicy(SecGpName, Ip)
{
 return postPolicy(SecGpName, Ip);
}


exports.getIPExemptions= function getIPExemptions(){

var validIpExe = JSON.stringify(getMessages());

return validIpExe;
}




//function to get the list of exempted IP from the dbIPsE
function getMessages(secPol, callback) {
  
 Message.find(function(err,message){
 
 
 if(err){
  logit(err);
  throw err;
}
 else{
  
  callback(null,secPol,message);
 }
});
}



//function to get the policy from the db
function getPolicy(callback) {

 Policy.find(function(err,message){ 
 if(err){
  logit(err);
   throw err;
 }
 else{
  callback(null,message);
  }
});
}

//function to Save the IP exemptions in the db
function postMessage(Ip, ex_date, User, SecGp) {
  
	var inputData = new Message({
          ipToBeExempted: Ip,
	  expiry_date: ex_date,
	  user: User,
	  created_date : Date.now(),
	  secGroup : SecGp
          });
          inputData.save(function(err) {
            if (err) logit(err);
            else logit('Saving message...');
          });
}
//function to get the Save the policy in the db
function postPolicy(SecGpName, Ip) {
  
	var inputData = new Policy({
          dbSecGpName: SecGpName,
          ipexempted: Ip
          });
          inputData.save(function(err) {
            if (err) logit(err);
            else logit('Saving policy...');
          });
}

//test.tests();
postPolicy("My_SecGp","0.0.0.0/0");
postMessage("0.0.0.0/0",Date.now()+70000,"Rohit",'default');
//removeExpired();

//scheduler which will remove expired entries
exports.removeExpired = function removeExpired()
{
	Message.find(function(err,data){
	if(err){
    logit(err);
		track(err);
	}
  else{
	
	var count =0;
	for(var j in data){
	
	 if(data[j].expiry_date < Date.now()){
		data[j].remove();
		count++;}
	}
  logit("Removing "+ count +" entries" )
	track("Removing "+ count +" entries" )
	}

	});

}
function logit(mess){
console.log(mess);
}

function track(mess){
console.log(mess);
}




