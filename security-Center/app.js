var dbSec = require('./dbSecPolicy.js');
var fmt = require('fmt');
var awssum = require('awssum');
var cfg=require('../config/config.js').cfg;
var amazon = awssum.load('amazon/amazon');
var Rds = awssum.load('amazon/rds').Rds;
var express = require('express');
/*var env             = process.env;
var accessKeyId     = env.ACCESS_KEY_ID;
var secretAccessKey = env.SECRET_ACCESS_KEY;
var awsAccountId    = env.AWS_ACCOUNT_ID;
*/
var http = require("http");
var async = require("async");
var secPol,IpEx;



 function launch(){
//schedule dbsec.removeExpired();
setTimeout(dbSec.removeExpired,cfg["time"]);
setTimeout(applySecpolicies,cfg["time"]);
//appySecPolicies

}
launch ();

//var dbro;

var rds = new Rds({
    'accessKeyId'     : cfg["accessKeyId"],
    'secretAccessKey' : cfg["secretAccessKey"],
    'region'          : cfg["region"]
});


/*fmt.field('Region', rds.region() );
fmt.field('EndPoint', rds.host() );
fmt.field('AccessKeyId', rds.accessKeyId().substr(0,3) + '...' );
fmt.field('SecretAccessKey', rds.secretAccessKey().substr(0,3) + '...' );
fmt.field('AwsAccountId', rds.awsAccountId() );*/



function applySecpolicies(){
async.waterfall([
  dbSec.getDbSecurityPolicies, dbSec.getDbSecurityMessages
,securityCheck],function(err,result){if(err){logit("apply sec policies failed "+err.stack) }});

}

function securityCheck(secPol,IpEx,callback){

rds.DescribeDBSecurityGroups(function(err, data) {


var dbSecGrps = data.Body.DescribeDBSecurityGroupsResponse.DescribeDBSecurityGroupsResult.DBSecurityGroups.DBSecurityGroup;

var match_sec_gp =0;
var match_Ip =0;
	dbSecGrps = sanitizeIpData(dbSecGrps);
	for(var i in dbSecGrps)
	{       
	var dbgrp = dbSecGrps[i];
	
	var ipranges = dbgrp.IPRanges.IPRange;

		if(ipranges && (secPol || IpEx)){
			
			ipranges = sanitizeIpData(ipranges);
			
			for(var IPs in ipranges)
			{
				
				for(var j in secPol)
				{
				
					var ipCIDR = ipranges[IPs].CIDRIP;
					var ipexe = secPol[j].ipexempted;
					
				 	if(ipCIDR.indexOf(ipexe) != -1)
					{
						
						match_sec_gp =1;
						break;
					}
				}
				if(match_sec_gp == 0){
					for(var k in IpEx)
					{
						var ipCIDRIP = ipranges[IPs].CIDRIP;
						var ipExe = IpEx[k].ipToBeExempted;

						if(ipCIDRIP.indexOf(ipExe) != -1)
						{
						
							match_Ip =1;
							break;
						}
					}
				}
				
				if((match_sec_gp ==0) && (match_Ip==0))
				{
					
					var CIDRIP =ipranges[IPs].CIDRIP;
					var DBSecurityGroupName = dbgrp.DBSecurityGroupName;
										
					Revoke(CIDRIP, DBSecurityGroupName);
							
				}
				else{match_sec_gp =0 ; vmatch_Ip =0;}
			}
		}
	}
});
}

function sanitizeIpData(ipranges){

	if(ipranges.length){}
	else{
	ipranges = [ipranges];
	}

	return ipranges;
}
function Revoke(CIDR, dbSecGpName)
{
	var params = {
		CIDRIP                  : CIDR,
	    DBSecurityGroupName     : dbSecGpName
	}	
	fmt.dump(params);
	rds.RevokeDBSecurityGroupIngress(params, function(err, data) {
				
	if(err){
	logit(err);
	//track(err);
	}
	else{
	logit(data);
	//track(data);
	}
	});
	
}
function logit(mess){
fmt.dump(mess);
console.log(mess);
}

function track(mess){
fmt.dump(mess);
}
/*http.createServer(function(request, response){
	response.writeHead(200, {"ContentType": "text/plain"});
	response.write(dbro);
	response.end();
}).listen(8000)*/





