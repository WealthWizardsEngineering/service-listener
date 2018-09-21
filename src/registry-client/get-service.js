const request = require('request-promise-native');
const env = require('../env-vars');

const getService = serviceName => request({
  url: `${env.SERVICE_REGISTRY_URL}/v1/service/${serviceName}`,
  method: 'GET',
  json: true,
});

module.exports = {
  getService,
};
