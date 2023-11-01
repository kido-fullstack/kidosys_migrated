const winston = require('winston');

const {config} = require("../config/default");

const conf = require('../config/');

const { combine, timestamp, printf, colorize, align, json, label } = winston.format;

let logger;

/*
Below is the winston err levels
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}

Below is the syslog err levels
{
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7
}
*/

if (conf.server.env !== 'production') {
  logger = winston.createLogger({
    level: conf.log.logLevel || 'info',
    format: combine(timestamp({
      format: 'MMMM Do YYYY, h:mm:ss.SSS a',  // January 31st 2022, 3:56:07 pm
    }), json()),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: `${config.logConfig.logFolder}${config.logConfig.logFile}`,
      }),
      new winston.transports.File({
        filename: `${config.errLogConfig.errLogFolder}${config.errLogConfig.errLogFile}`,
        level: 'error',
      })
    ],
    exceptionHandlers: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `${config.expLogConfig.expLogFolder}${config.expLogConfig.expLogFile}` })
    ],
    rejectionHandlers: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `${config.rejLogConfig.rejLogFolder}${config.rejLogConfig.rejLogFile}` })
    ]
  });
} else {
  logger = winston.createLogger({
    level: conf.log.logLevel || 'info',
    format: combine(timestamp({
      format: 'MMMM Do YYYY, h:mm:ss.SSS a',  // January 31st 2022, 3:56:07 pm
    }), json()),
    transports: [
      new winston.transports.File({
        filename: `${config.errLogConfig.errLogFolder}${config.errLogConfig.errLogFile}`,
        level: 'error',
      })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: `${config.expLogConfig.expLogFolder}${config.expLogConfig.expLogFile}` })
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: `${config.rejLogConfig.rejLogFolder}${config.rejLogConfig.rejLogFile}` })
    ]
  });
}

module.exports = logger;