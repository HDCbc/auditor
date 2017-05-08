// Setup the logger based on configuration.
// This should be loaded before any of the modules that rely on winston.
require('./logger-setup');

// Import npm modules.
const async = require('async');
const logger = require('winston');
const opn = require('opn');
const cp = require("child_process");
const express = require("express");

// Import local modules.
const config = require('../config/app-config');
const queries = require('../config/query-config');
const vault = require('./vault');

/**
 * This module is the backbone of the application. It contains the the majority of the business
 * logic and dictates the flow of the application.
 *
 * @module app
 */
module.exports = (function app() {
  /**
   * This function opens a local browser window
   */
  function setupHttp(callback) {
    // open a browser window
    // opn('http://localhost:56304');

    //start web server

    return callback();
  }

  /**
   * This function will perform the specified queries against the Universal Schema. The queries
   * will be run in parallel (up to 5 at once).
   *
   * Note that if any of the queries fail to run, then an error will be returned in the callback.
   *
   * @param {array} queryList - An array of queries to perform.
   * @param {Function} callback - A callback to run on completion of the queries.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @param {int} callback.results - An array containing the results of the query.
   * @returns {void}
   */
  function queryPerform(queryList, callback) {
    logger.info('app.queryPerform()');

    const limit = config.maxParallelQueries;

    async.mapLimit(queryList, limit, vault.performAggregateQuery, (err, results) => {
      // this gets returned once with all results in an object
      callback(err, results);
    });
  }

  function run() {
    logger.info('app.run()');

    // Initialize express application
    const app = express();

    app.use(express.static(__dirname));

    app.get('/msg', function(req, res){
      res.writeHead(200, { "Content-Type": "text/event-stream",
                           "Cache-control": "no-cache" });

      var spw = cp.spawn('ping', ['-n', '100', '127.0.0.1']),
      str = "";

      spw.stdout.on('data', function (data) {
          str += data.toString();

          // just so we can see the server is doing something
          console.log("data");

          // Flush out line by line.
          var lines = str.split("\n");
          for(var i in lines) {
              if(i == lines.length - 1) {
                  str = lines[i];
              } else{
                  // Note: The double-newline is *required*
                  res.write('data: ' + lines[i] + "\n\n");
              }
          }
      });

      spw.on('close', function (code) {
          res.end(str);
      });

      spw.stderr.on('data', function (data) {
          res.end('stderr: ' + data);
      });
    });

    app.listen(4000);

    /*async.waterfall([
      setupHttp,
      vault.retrieveIndicatorsQuery,
      queryPerform,
    ], (err) => {
      if (err) {
        logger.error('The application encountered a fatal error', err);
        process.exit(1);
      }

      process.exit(0);
    });*/
  }

  return {
    run,
  };
}());
