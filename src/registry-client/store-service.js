const request = require('request-promise-native');
const co = require('co');
const logger = require('../logger');
const { getService } = require('./get-service');
const env = require('../env-vars');

function sanitiseResponse(service) {
  const sanitisedService = JSON.parse(JSON.stringify(service));
  delete sanitisedService.__v;
  delete sanitisedService.createdAt;
  delete sanitisedService.updatedAt;
  return sanitisedService;
}

function updateEnvironmentBaseUrl(service, environmentId, baseUrl) {
  let result = false;
  if (service.environments == null) {
    service.environments = [];
  } else {
    service.environments.some(environment => {
      if (environment._id === environmentId) {
        environment.baseUrl = baseUrl;
        result = true;
        return true;
      }
      return false;
    });
  }
  return result;
}

const storeService = (serviceName, environment, links = null, tags = null) => co(function* () {
  return yield getService(serviceName);
}).then(retreivedService => {
  if (retreivedService == null) {
    const newService = {
      _id: serviceName, links, tags, environments: [environment],
    };

    logger.debug(`Storing new service: ${JSON.stringify(newService, null, 2)}`);
    return request({
      url: `${env.SERVICE_REGISTRY_URL}/v1/service`,
      method: 'POST',
      json: true,
      body: newService,
    });
  }
  const updatedService = sanitiseResponse(retreivedService);
  updatedService.links = links;
  updatedService.tags = tags;

  if (!updateEnvironmentBaseUrl(updatedService, environment._id, environment.baseUrl)) {
    updatedService.environments.push(environment);
  }
  logger.debug(`Updating existing service: ${JSON.stringify(updatedService, null, 2)}`);

  return request({
    url: `${env.SERVICE_REGISTRY_URL}/v1/service/${serviceName}`,
    method: 'PUT',
    json: true,
    body: updatedService,
  });
}).catch(error => {
  logger.warn(`Failed to store service [${environment._id}/${serviceName}]: ${error}`);
});

module.exports = {
  storeService,
};
