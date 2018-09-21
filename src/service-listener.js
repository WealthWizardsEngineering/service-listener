#!/usr/bin/env node

const Client = require('kubernetes-client').Client;
const env = require('./env-vars');
const logger = require('./logger');

const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { updateServiceRegistry } = require('./deployment-change-handlers/update-service-registry');
const { updateVersionService } = require('./deployment-change-handlers/update-version-service');

function onDeploymentChange(deploymentObject) {
  logger.trace('Received deployment object: ', JSON.stringify(deploymentObject, null, 2));
  updateServiceRegistry(deploymentObject);
  updateVersionService(deploymentObject);
}

async function main() {
  try {
    const client = new Client({
      config: {
        url: env.KUBERNETES_MASTER_URL,
        insecureSkipTlsVerify: true,
        auth: {
          user: env.KUBERNETES_USERNAME,
          pass: env.KUBERNETES_PASSWORD,
        },
      },
      version: '1.10',
    });

    listenForDeployments(client, env.KUBERNETES_NAMESPACE, onDeploymentChange);
  } catch (err) {
    logger.error(`Error: ${err}`);
  }
}

main();
