var aws    = require('aws-sdk');
var awssum = require('awssum');
var cfg    = require('./config.js');

aws.config.update({accessKeyId: cfg.config["AccessKey"], secretAccessKey: cfg.config["SecretKey"]});
aws.config.update({region: cfg.config["Region"]});

exports.getEC2Client = function getEC2Client(){
	var ec2 = new aws.EC2();
	return ec2;
}

exports.getEC2AwssumClient = function getEC2AwssumClient(){
	var ec2 = awssum.load('amazon/amazon');
	return ec2;
}

exports.getEC2CloudwatchClient = function getEC2CloudwatchClient(){
	var Cloudwatch = awssum.load('amazon/cloudwatch').CloudWatch;
	var cloudwatch = new Cloudwatch({'accessKeyId'     :  cfg.config["AccessKey"], 
								     'secretAccessKey' :  cfg.config["SecretKey"], 
								     'region'          :  cfg.config["Region"]
								   });
	return cloudwatch;

}
