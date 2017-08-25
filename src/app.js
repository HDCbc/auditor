// Setup the logger based on configuration.
// This should be loaded before any of the modules that rely on winston.
require('./logger-setup');

// Import npm modules.
const async = require('async');
const logger = require('winston');
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
    async.waterfall([
      vault.retrieveIndicatorsQuery,
      queryPerform,
    ], (err) => {
      if (err) {
        logger.error('The application encountered a fatal error', err);
        process.exit(1);
      }

      process.exit(0);
    });
  }

  return {
    run,
  };
}());
