var map = new Object();
var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
map["MONGO_HOST"]="HOSTNAME";
map["DB_NAME"]="DBNAME";

map["accessKeyId"]="XXXXXXXXXXXXXXXXXXXX";
map["secretAccessKey"]="YYYYYYYYYYYYYYYYYYYY";
map["region"]= "RRRRRRRRRRRRRRRRR";
map["time"]= 60*1000;
exports.cfg=map;
