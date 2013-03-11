var winston = require('winston');
var bdp = require('./config/config.js').cfg['BASE_DATA_PATH'];
winston.add(winston.transports.File, { filename: bdp+'raws.log',maxsize:(1024*1000*10),maxFiles:10});
//winston.remove(winston.transports.Console);

winston.loggers.add('error', {
   console: {
      level: 'none'
    },
    file: {
      filename: bdp+'error.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });

exports.logger=winston;



