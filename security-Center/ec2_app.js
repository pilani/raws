var dbSec = require('./ec2_dbSecPolicy.js');
var fmt = require('fmt');
var awssum = require('awssum');
var cfg=require('../config/ec2_config.js').cfg;
var amazon = awssum.load('amazon/amazon');
var Ec2 = awssum.load('amazon/ec2').Ec2;
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

var ec2 = new Ec2({
    'accessKeyId'     : cfg["accessKeyId"],
    'secretAccessKey' : cfg["secretAccessKey"],
    'region'          : cfg["region"]
});

var fmt = require('fmt');

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

ec2.DescribeSecurityGroups(function(err, data) {
//console.log("Eroor"+ JSON.stringify(err));
//console.log("DATA" + JSON.stringify(data));
//fmt.dump(data.Body.DescribeSecurityGroupsResponse.securityGroupInfo.item);
var dbSecGrps = data.Body.DescribeSecurityGroupsResponse.securityGroupInfo.item;

var match_sec_gp =0;
var match_Ip =0;
dbSecGrps = sanitizeIpData(dbSecGrps);
	for(var i in dbSecGrps)
	{       
	var dbgrp = dbSecGrps[i];

	var ipPer = dbgrp.ipPermissions;
	var groupId = dbgrp.groupId;
	var groupName = dbgrp.groupName;
	//fmt.dump(ipPer);
	 sanitizeIpData(ipPer);

		
		for(var k in ipPer.item)
		{
			//console.log("HERE I AM ::: "+ JSON.stringify(ipPer));

		var ipranges = ipPer.item[k].ipRanges;
		//ipranges = sanitizeIpData(ipranges);
		//console.log("\n NEW LINE"+ JSON.stringify(ipranges));
		//fmt.dump(ipranges);
		if(ipranges)
		{
			if(ipranges.item  && ipranges.item.cidrIp)
			ipranges = ipranges.item.cidrIp;
			
		}
		else
			ipranges = {} ;
		ipranges = sanitizeIpData(ipranges);
		//console.log("\n here is my final ipranges::::::::::::::::::::: \n");
		//fmt.dump(JSON.stringify(ipranges));
		if(ipranges && (secPol || IpEx)){
					
			//for(var IPs in ipranges.item)
			//{
				//console.log("\n SECURITY POLICY ***************** \n" + JSON.stringify(secpol) );
				for(var j in secPol)
				{
				
					var ipCIDR = ipranges;
					var secpol = secPol[j].ipexempted;
					console.log("CIDR IPs are" +ipCIDR);
					console.log("\n SECURITY POLICY ***************** \n" + secpol );
					if(ipCIDR.indexOf(secpol) != -1)
					{
						
						match_sec_gp =1;
						break;
					}
					console.log("MATCH RESULTS" +match_sec_gp);
				}

				if(match_sec_gp == 0){
					//console.log("\n IP EXEMPTION LIST &&&&&&&&&&&&& \n"+JSON.stringify(ipExe));
					for(var k in IpEx)
					{
						var ipCIDRIP = ipranges;
						var ipExe = IpEx[k].ipToBeExempted;
						console.log("\n IP EXEMPTION LIST &&&&&&&&&&&&& \n"+ ipExe);
						if(ipCIDRIP.indexOf(ipExe) != -1)
						{
						
							match_Ip =1;
							break;
						}
					}
				}
				
				if((match_sec_gp ==0) && (match_Ip==0))
				{
					
					var CIDRIP =ipPer;
					var SecurityGroupName = dbgrp.SecurityGroupName;
					//testRevoke(ipPer.item[1]);					
					Revoke(groupId, groupName, ipPer.item[1]);

							
				}
				else{match_sec_gp =0 ; vmatch_Ip =0; }
			//}
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

function testRevoke(iptest){

Revoke('sg-3d160555','AWS-OpsWorks-PHP-App-Server', iptest);

}

function Revoke(groupId, groupName, ipPer)
{
	console.log("\n &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& REVOKING &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& \n");
	var params = {
		GroupId       : groupId,
            GroupName     : groupName,
            IpPermissions : ipPer
	}	
	fmt.dump(params);
	ec2.RevokeSecurityGroupIngress(params, function(err, data) {
				
	if(err){
	logit(err);
	//track(err);

	}
	else{
		console.log("SUCESS REVOKE::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
	logit(data);
	//track(data);
	}
	});
	
}
function logit(mess){
fmt.dump(mess);
//console.log(mess);
}

function track(mess){
fmt.dump(mess);
}
/*http.createServer(function(request, response){
	response.writeHead(200, {"ContentType": "text/plain"});
	response.write(dbro);
	response.end();
}).listen(8000)*/





