var accountvo = require('../vo/accountdetailsvo.js');
var accountlist = require('../vo/accountdetailsvo.js');

exports.getaccounts = function(req,res) {
	 
	var acDetailsArray = new Array(); 

	for (var i = 1; i < 5; i++) {
		
		var acDetails = new accountvo();
		
		acDetails.name = "redBus - "+i;
		acDetails.usagecharges ="$233"+i;
		acDetails.avgcpu = "50%";
		acDetails.avgmemorey ="20%";
		acDetails.avgnetwork = "10%";

        acDetailsArray.push(acDetails);
	}

	var list = new accountlist();
	list.accountdetailsvo = acDetailsArray;

  var jsonString = JSON.stringify(list);
  res.send(jsonString);
  res.end();
}


exports.getservicesbyaccount = function(req,res) {
	res.send("impl is pending....");
    res.end();
}