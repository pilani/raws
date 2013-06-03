
/*
 * GET home page.
 */

exports.siteMonitor = function(req, res){
  res.render('siteMonitor', { title: ' Disaster Recovery Stats' })
};
exports.copyStats=function(req,res){
	res.render('copyStats',{title:'Disaster Recovery Copy Stats'})
};
