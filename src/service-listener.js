#!/usr/bin/env node
const env = require('./env-vars');
const logger = require('ww-logging').logger();

const { storeService } = require('./registry-client/store-service');
const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { getIngress } = require('./kubernetes-client/get-ingress');

listenForDeployments(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, function(object) {
  const serviceName = object.object.metadata.name;

  const environment = {
    _id: object.object.metadata.namespace,
    baseUrl: 'http://unknown'
  }

  getIngress(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, serviceName)
    .then((response) => {
      const baseUrl = 'https://' + response.spec.rules[0].host + response.spec.rules[0].http.paths[0].path;
      logger.info(`Base URL for ${serviceName}: ${baseUrl}`);
      environment.baseUrl = baseUrl;
    })
    .catch((error) => {
      logger.warn(`Unable to retrieve base URL for ${serviceName}, perhaps this service does not have an ingress controller: ${error}`);
    });

  // const pingUrl = object.object.metadata.annotations["ww-ping-path"];
  // const healthUrl = object.object.metadata.annotations["ww-health-path"];
  // const sourceRepo = object.object.metadata.annotations["ww-source-repo"];
  // const replicas = object.object.spec.replicas;
  // const image = object.object.spec.template.spec.containers[0].image;
  // const statusReplicas = object.object.status.replicas;
  // const statusUpdatedReplicas = object.object.status.updatedReplicas;
  // const statusAvailableReplicas = object.object.status.availableReplicas;
  // var date = new Date();
  // console.log(`${date} Deployment[${serviceName}] namespace: ${namespace}`);
  // console.log(`${date} Deployment[${serviceName}] ping url: ${pingUrl}`);
  // console.log(`${date} Deployment[${serviceName}] health url: ${healthUrl}`);
  // console.log(`${date} Deployment[${serviceName}] source repo: ${sourceRepo}`);
  // console.log(`${date} Deployment[${serviceName}] replicas: ${replicas}`);
  // console.log(`${date} Deployment[${serviceName}] image: ${image}`);
  // console.log(`${date} Deployment[${serviceName}] status replicas: ${statusReplicas}`);
  // console.log(`${date} Deployment[${serviceName}] status updated replicas: ${statusUpdatedReplicas}`);
  // console.log(`${date} Deployment[${serviceName}] status available replicas: ${statusAvailableReplicas}`);

  storeService(serviceName, environment)
    .then( () => {
    logger.info(`Service ${serviceName} stored OK`);
  })
    .catch( error => {
      logger.warn(`Service ${serviceName} failed to be stored: ${error}`);
  });

});


