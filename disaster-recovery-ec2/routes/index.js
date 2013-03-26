
/*
 * GET home page.
 */

exports.bqhome = function(req, res){
  res.render('siteMonitor', { title: 'Disaster Recovery Stats' })
};

