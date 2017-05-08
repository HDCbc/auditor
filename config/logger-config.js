/**
 * This module will contain all of the configuration information for the logger.
 * @module config-logger
 */
module.exports = {
  console: {
    level: 'debug',
    prettyPrint: false,
    json: false,
    colorize: true,
    timestamp: false,
    humanReadableUnhandledException: true,
  },
  file: {
    level: 'debug',
    colorize: 'true',
    timestamp: 'true',
    filename: 'logs/logfile.log',
    maxsize: 5 * 1024 * 1024, // 5MB
    maxFiles: 20, // So 5MB x 20 files = 100MB of logs total (except they get zipped)
    json: false,
    prettyPrint: true,
    tailable: true,
    zippedArchive: true,
  },
};
