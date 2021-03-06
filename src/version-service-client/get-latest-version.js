const request = require('request-promise-native');
const logger = require('../logger');
const env = require('../env-vars');

const getLatestVersion = (environment, serviceName) => new Promise((resolve => {
  request({
    url: `${env.VERSION_SERVICE_URL}/v1/version?environment=${environment}&application_name=${serviceName}`,
    method: 'GET',
    json: true,
  })
    .then(response => {
      if (response.length > 0) {
        resolve(response[0]);
      } else {
        logger.info(`Could not find any matching versions for ${environment}/${serviceName}`);
        resolve(null);
      }
    })
    .catch(error => {
      logger.warn(`Error getting latest version: ${environment}/${serviceName} - ${error}`);
    });
}));

module.exports = {
  getLatestVersion,
};
