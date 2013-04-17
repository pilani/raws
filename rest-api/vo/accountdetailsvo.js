// Constructor
var accountdetailsvo = function(id,name, usagecharges,avgcpu,avgmemorey,avgnetwork) {
  this.id =id;
  this.name = name;
  this.usagecharges = usagecharges;
  this.avgcpu = avgcpu;
  this.avgmemorey = avgmemorey;
  this.avgnetwork = avgnetwork;
}

// node.js module export
module.exports = accountdetailsvo;