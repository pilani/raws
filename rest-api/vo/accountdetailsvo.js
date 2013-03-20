// Constructor
var accountdetailsvo = function(name, usagecharges,avgcpu,avgmemorey,avgnetwork) {
  this.name = name;
  this.usagecharges = usagecharges;
  this.avgcpu = avgcpu;
  this.avgmemorey = avgmemorey;
  this.avgnetwork = avgnetwork;
}

// node.js module export
module.exports = accountdetailsvo;