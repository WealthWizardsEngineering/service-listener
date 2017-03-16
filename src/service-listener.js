#!/usr/bin/env node
const env = require('./env-vars');
const logger = require('ww-logging').logger();

const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { updateServiceRegistry } = require('./deployment-change-handlers/update-service-registry');

listenForDeployments(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, onDeploymentChange);

function onDeploymentChange(deploymentObject) {
  updateServiceRegistry(deploymentObject);
  // add other handlers here...
}
