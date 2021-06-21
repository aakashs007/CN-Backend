/*This makes use of loglevel logger package. Load it and set the logging level 
based on the executing environment. The log object is exported as a module and can be used by other modules. */

var Logger = require("loglevel").getLogger("MainLog");

let logLevel = process.env.LOG_LEVEL || 'debug';

Logger.setLevel(logLevel);

Logger.info("Logger is enabled with log level as:"+logLevel);

module.exports = Logger;