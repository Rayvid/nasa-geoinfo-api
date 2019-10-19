const healthCheckRoutes = require('./healthcheck');
const versionCheck = require('./versionCheck');
const clickhouseToGeojson = require('./clickhouseToGeojson');

module.exports = {
  fetchGeoJson: clickhouseToGeojson.fetchGeoJson,
  healthCheck: healthCheckRoutes.healthCheck,
  sentryPing: healthCheckRoutes.sentryPing,
  versionCheck,
};
