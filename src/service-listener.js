#!/usr/bin/env node

const Client = require('kubernetes-client').Client;
const env = require('./env-vars');
const logger = require('./logger');

const { listenForDeployments } = require('./kubernetes-client/deployment-listener');
const { updateConsul } = require('./deployment-change-handlers/update-consul');
const { updateServiceRegistry } = require('./deployment-change-handlers/update-service-registry');
const { updateVersionService } = require('./deployment-change-handlers/update-version-service');

function isUpdateAboutOldDeployment(deployment) {
  return deployment.object.metadata.generation !== deployment.object.status.observedGeneration;
}

function isStatusAboutOngoingDeployment(deployment) {
  return !deployment.object.status.conditions.some(c => c.reason === 'NewReplicaSetAvailable');
}

function ignoreUpdateAboutOngoingDeployment(deployment) {
  if (deployment.type !== 'MODIFIED') {
    return false;
  }

  return isUpdateAboutOldDeployment(deployment) || isStatusAboutOngoingDeployment(deployment);
}

function onDeploymentChange(deploymentObject) {
  logger.trace('Received deployment object: ', JSON.stringify(deploymentObject, null, 2));

  if (ignoreUpdateAboutOngoingDeployment(deploymentObject)) {
    // Ignoring all updates about ongoing deployment
    // We only want to send update once a deployment is done
    return;
  }

  updateConsul(deploymentObject);
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

    const namespaces = await client.api.v1.namespaces.get();
    namespaces.body.items.forEach(namespace => {
      if (env.KUBERNETES_NAMESPACES.split(',').includes(namespace.metadata.name)) {
        listenForDeployments(client, namespace.metadata.name, onDeploymentChange);
      }
    });
  } catch (err) {
    logger.error(`Error: ${err}`);
  }
}

main();
