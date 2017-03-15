const env = require('../env-vars');
const logger = require('ww-logging').logger();

const { getIngress } = require('../kubernetes-client/get-ingress');
const { storeService } = require('../registry-client/store-service');

const updateServiceRegistry = ((deploymentObject) => {
  const namespace = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.name;

  getIngress(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, serviceName)
    .then((response) => {
      const baseUrl = 'https://' + response.spec.rules[0].host + response.spec.rules[0].http.paths[0].path;
      logger.info(`Base URL for ${serviceName}: ${baseUrl}`);
      createService(namespace, serviceName, baseUrl);
    })
    .catch((error) => {
      logger.warn(`Unable to retrieve base URL for ${serviceName}, perhaps this service does not have an ingress controller: ${error}`);
      createService(namespace, serviceName, 'http://unknown');
    });

});

function createService(namespace, serviceName, baseUrl) {
  const environment = {
    _id: namespace,
    baseUrl: baseUrl
  }

  storeService(serviceName, environment)
    .then( () => {
      logger.info(`Service ${serviceName} stored OK`);
    })
    .catch( error => {
      logger.warn(`Service ${serviceName} failed to be stored: ${error}`);
    });
}

module.exports = {
  updateServiceRegistry,
};
