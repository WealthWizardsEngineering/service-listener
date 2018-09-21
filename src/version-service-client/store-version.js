const request = require('request-promise-native');
const co = require('co');
const logger = require('../logger');
const { getLatestVersion } = require('./get-latest-version');
const env = require('../env-vars');

function postNewService(environment, applicationName, version) {
  const newVersionRecord = { environment, application_name: applicationName, version };
  logger.debug(`Storing new version: ${JSON.stringify(newVersionRecord, null, 2)}`);
  return request({
    url: `${env.VERSION_SERVICE_URL}/v1/version`,
    method: 'POST',
    json: true,
    body: newVersionRecord,
  });
}

const storeVersion = (environment, serviceName, version) => co(function* () {
  return yield getLatestVersion(environment, serviceName);
}).then(retrievedVersion => {
  if (retrievedVersion != null && retrievedVersion.version === version) {
    logger.debug(`The version hasn't changed [${environment}/${serviceName}]`);
  } else {
    return postNewService(environment, serviceName, version);
  }
  return null;
}).catch(error => {
  logger.warn(`Failed to store version [${environment}/${serviceName}]: ${error}`);
});

module.exports = {
  storeVersion,
};
