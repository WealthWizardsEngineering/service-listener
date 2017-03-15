#!/usr/bin/env node
const env = require('./env-vars');
const logger = require('ww-logging').logger();

const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { storeService } = require('./registry-client/store-service');
const { getIngress } = require('./kubernetes-client/get-ingress');
const { updateServiceRegistry } = require('./deployment-change-handlers/update-service-registry');

listenForDeployments(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, onDeploymentChange);

function onDeploymentChange(deploymentObject) {
  updateServiceRegistry(deploymentObject);
  logDeployment(deploymentObject);
}

function logDeployment(deploymentObject) {
  console.log(deploymentObject);
}

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
