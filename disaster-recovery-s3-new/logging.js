var logger = require('./logger.js').logger;


exports.logInfo=function logInfo(message){

logger.info(message);



}

exports.logError=function logError(error){

	logger.error(error+"  ,Timestamp" + new Date());
}