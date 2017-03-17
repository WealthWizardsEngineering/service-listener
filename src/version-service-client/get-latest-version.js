const request = require('request-promise-native');
const env = require('../env-vars');
const logger = require('ww-logging').logger();

const getLatestVersion = (environment, serviceName) => {
  return new Promise(function(resolve, reject) {
    request({
      url: `${env.VERSION_SERVICE_URL}/v1/version?environment=${environment}&application_name=${serviceName}`,
      method: 'GET',
      json: true,
    })
    .then((response) => {
      if (response.length > 0) {
        resolve(response[0]);
      } else {
        logger.warn(`Could not find any matching versions for ${environment}/${serviceName}`)
        resolve(null);
      }
    })
    .catch((error) => {
      logger.error(`Error getting latest version: ${environment}/${serviceName} - ${error}`);
    });
  });
}

module.exports = {
  getLatestVersion,
};
