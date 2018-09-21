#!/usr/bin/env node
const env = require('./env-vars');

const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { updateServiceRegistry } = require('./deployment-change-handlers/update-service-registry');
const { updateVersionService } = require('./deployment-change-handlers/update-version-service');

function onDeploymentChange(deploymentObject) {
  updateServiceRegistry(deploymentObject);
  updateVersionService(deploymentObject);
}

listenForDeployments(
  env.KUBERNETES_MASTER_URL,
  env.KUBERNETES_NAMESPACE,
  env.KUBERNETES_USERNAME,
  env.KUBERNETES_PASSWORD,
  onDeploymentChange
);
