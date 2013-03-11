var dbSec = require('./dbSecPolicy.js');
var fmt = require('fmt');
var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
var Rds = awssum.load('amazon/rds').Rds;
var express = require('express');

var Ip = JSON.stringify("10.120.10.103");
var CIDR = JSON.stringify("10.120.10.103/8");
if(CIDR.indexOf(Ip) != -1)
	console.log("YES , A Substring");
else
console.log("No, Not a Substring");
