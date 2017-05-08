const fs = require('fs');
const request = require('request');
const logger = require('winston');
const url = require('url');

const config = require('../config/central-config');

/**
 * This module will provide the interface with the Central Server.
 *
 * @param {Object} db - An instance of a database connection.
 * @param {Object} logger - An instance of a logger.
 * @module central
 */
module.exports = (function central() {
  const myQueries = [
    { id: 1, indicator: 'diabetic_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 2, indicator: 'copd_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 3, indicator: 'chf_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 4, indicator: 'diabetic_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 5, indicator: 'copd_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 6, indicator: 'chf_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 7, indicator: 'diabetic_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01' },
    { id: 8, indicator: 'copd_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01-01' },
    { id: 9, indicator: 'chf_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01' },
    { id: 10, indicator: 'diabetic_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
    { id: 11, indicator: 'copd_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
    { id: 12, indicator: 'chf_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
  ];

  const myResults = [

  ];

  const NO_UPDATES_FOUND = 'No Updated Found';
  const NO_QUERIES_FOUND = 'No Queries Found';
  /**
   * Request a new batch of updates from the HDC Central server.
   */
  function requestUpdates(version, callback) {
    logger.info('central.requestUpdates()', version);

    // FIXME: Mutual Authentication
    const options = {
      method: 'POST',
      url: config.baseUrl + '/request_updates',
      cert: fs.readFileSync(config.certFile, { encoding: 'utf-8' }),
      key: fs.readFileSync(config.keyFile, { encoding: 'utf-8' }),
      ca: [fs.readFileSync(config.caFile, { encoding: 'utf-8' })],
      // ca: fs.readFileSync(config.caFile),
      json: {
        version,
      },
    };

    request.post(options, (err, message, response) => {
      // FIXME: Validate the content / structure of the response.
      return callback(err, response);
      // FIXME: Deal with callback(NO_UPDATES_FOUND);
    });
  }

  /**
   * Request a new batch of queries from the HDC Central server.
   */
  function requestQueries(callback) {
    logger.info('central.requestQueries()');

    const required =
      myQueries
      .filter(q => !myResults.find(r => r.query.id === q.id))
      .slice(0, 3);

    if (required.length === 0) {
      return callback(NO_QUERIES_FOUND);
    }

    return callback(null, required);
  }

  /**
   * Sends the result of queries back to the central server.
   */
  function sendResults(results, callback) {
    logger.info('central.sendResults()', results);

    // Append the new results to our overall list of results
    myResults.push(...results);

    callback(null, null);
  }

  return {
    requestUpdates,
    requestQueries,
    sendResults,
    NO_UPDATES_FOUND,
    NO_QUERIES_FOUND,
  };
}());
