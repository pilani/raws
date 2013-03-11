var AWS = require('aws-sdk');

AWS.config.update({accessKeyId: 'AAAAAAAAAAAAAAAAAA', secretAccessKey: '#333333333333333333333'});

AWS.config.update({region: 'AAAAAAAAAAAAAAAA'});

exports.getEC2Client = function getEC2Client(){
	var ec2 = new AWS.EC2();
	return ec2;
}
