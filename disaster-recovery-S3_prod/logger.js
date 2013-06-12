var winston = require('winston');
var bdp = require('./config.js').config['BASE_DATA_PATH'];
winston.add(winston.transports.File, { filename: bdp+'disasterRecoveryS3.log',maxsize:(1024*1000*10),maxFiles:10});
winston.remove(winston.transports.Console);
//winston.add(winston.transports.File, { filename: 'error.log' ,level:'error',maxsize:(1024*1000*10),maxFiles:20});
winston.loggers.add('bqimport', {
   console: {
      level: 'none'
    },
    file: {
      filename: bdp+'bqimport.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });
winston.loggers.add('mess', {
   console: {
      level: 'none'

    },
    file: {
      filename: bdp+'mess.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });
winston.loggers.add('messerror', {
   console: {
      level: 'none'

    },
    file: {
      filename: bdp+'messerror.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });
winston.loggers.add('fileuploader', {
   console: {
      level: 'none'

    },
    file: {
      filename: bdp+'fileuploader.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });
winston.loggers.add('FileNotFoundError', {
   console: {
      level: 'none'

    },
    file: {
      filename: bdp+'FileNotFoundError.log',maxsize:(1024*1000*10),maxFiles:20
    }
  });

exports.logger=winston;



