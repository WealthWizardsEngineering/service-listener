const request = require('request-promise-native');
const { getLatestVersion } = require('./get-latest-version');
const env = require('../env-vars');
const co = require('co');
const logger = require('../logger');

const storeVersion = (environment, serviceName, version) =>
{
  return co(function*() {
    return yield getLatestVersion(environment, serviceName);
  }).then(function (retrievedVersion) {
    if (retrievedVersion != null && retrievedVersion.version === version) {
      logger.debug(`The version hasn't changed [${environment}/${serviceName}]`)
    } else {
      return postNewService(environment, serviceName, version);
    }
  }).catch((error) => {
    logger.warn(`Failed to store version [${environment}/${serviceName}]: ${error}`);
  });
}

function postNewService(environment, application_name, version) {
  const newVersionRecord = {environment, application_name, version};
  logger.debug(`Storing new version: ` + JSON.stringify(newVersionRecord, null, 2));
  return request({
    url: `${env.VERSION_SERVICE_URL}/v1/version`,
    method: 'POST',
    json: true,
    body: newVersionRecord
  });
}

module.exports = {
  storeVersion,
};
