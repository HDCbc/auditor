const logger = require('winston');

const db = require('./database');

/**
 * This module will provide the interface with the Vault. All queries and updates that hit the Vault
 * including the Indicator, Concept, and Universal schema are run through this module. Furthermore
 * it should all run through functions in the API schema.
 *
 * @param {Object} db - An instance of the database module.
 * @module vault
 */
module.exports = (function vault() {
  // Create a dictionary of query timers that are referenced by indicator reference name
  const timers = {};

  function sanitizeAggregate(row = {}) {
    const clean = {};
    if(row.length > 0) {
      clean.count = Number.isInteger(row[0].count) ? row[0].count : null;
      clean.numerator = Number.isInteger(row[0].numerator) ? row[0].numerator : null;
      clean.denominator = Number.isInteger(row[0].denominator) ? row[0].denominator : null;
    }

    return clean;
  }

  /**
   * This function will perform a query against the Vault by running the api.performAggregateQuery
   * database function and returning an aggregate numerator/denominator or count.
   *
   * The database function should ensure that only aggregate results are returned. However, since it
   * is possible that it may be compromised, this code function also performs its own check to
   * ensure that only aggregate results are returned.
   *
   * @param {Object} query - The query to run against the Vault.
   * @param {string} query.indicator - The name of the indicator to run. This
   * must directly match the name of a function within the Indicator schema in the Vault.
   * @param {string} query.clinic - The clinic to run the query against.
   * This must match a guid within universal.clinic.hdc_reference.
   * @param {string} query.provider - The provider to run the query against.
   * @param {string} query.effectiveDate - The effective date of the query.
   *
   * @param {Function} callback - A callback to run on completion.
   * @param {Object} callback.error - This will always be null! Errors will be found in the results
   * object as specified below.
   * @param {Object} callback.results - The results of the query.
   * @param {Object} callback.results.query - The original query object that was passed to this
   * function.
   * @param {Object} callback.results.error - If an error occured this will include details
   * on the error.
   * @param {Object} callback.results.results - The results (rows) of the SQL query.
   *
   * @returns {void}
   */
  function performAggregateQuery(query, callback) {
    // logger.info('vault.performAggregateQuery()');

    const dbQuery = 'SELECT * FROM api.perform_aggregate_query(p_indicator:=$1, p_clinic:=$2, p_provider:=$3, p_effective_date:=$4);';

    const dbParams = [
      query.indicator,
      query.clinic,
      query.provider,
      query.effectiveDate,
    ];

    // start timer and reference with indicator xml name
    timers[query.indicator]  = new Date();
    console.log(query.indicator);

    db.runQuery(dbQuery, dbParams, 'All', (error, row) => {
      // stop timer
      const executionTime = new Date() - timers[query.indicator];
      console.log(`${query.indicator}|${executionTime}`);

      // Sanitize the return rows to ensure that only aggregate data is returned.
      const results = sanitizeAggregate(row);
      // Note that we are "hiding" the error and instead of returning it as the
      // first parameter of the callback, we are including it in the results
      // object. This is because we are running a bunch of queries at the same
      // time and if an error is returned then they will all instantly stop.
      callback(null, { query, error, results});
    });
  }

  function retrieveIndicatorsQuery(callback) {
    // logger.info('vault.retrieveIndicatorsQuery()');

    const dbQuery = `SELECT routines.routine_name FROM information_schema.routines WHERE routines.specific_schema='${'indicator'}'`;

    db.runQuery(dbQuery, [], 'All', (error, results) => {
      let indicators = [];

      for (var key in results) {
        // skip loop if the property is from prototype
        if (!results.hasOwnProperty(key)) continue;

        var obj = results[key];
        for (var prop in obj) {
          // skip loop if the property is from prototype
          if(!obj.hasOwnProperty(prop)) continue;

          indicators.push({
              indicator: obj[prop],
              clinic: '',
              provider: '',
              effectiveDate: '2017-01-01',
          });
        }
      }

      callback(null, indicators);
    });
  }


  return {
    sanitizeAggregate,
    performAggregateQuery,
    retrieveIndicatorsQuery,
  };
}());
