const Operator = require('@dot-i/k8s-operator').default;
const { ResourceEventType } = require('@dot-i/k8s-operator');

const env = require('../env-vars');
const logger = require('../logger');
const { updateConsul } = require('../deployment-change-handlers/update-consul');
const { updateServiceRegistry } = require('../deployment-change-handlers/update-service-registry');
const { updateVersionService } = require('../deployment-change-handlers/update-version-service');

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
  logger.trace('Received deployment event: ', JSON.stringify(deploymentObject, null, 2));

  if (ignoreUpdateAboutOngoingDeployment(deploymentObject)) {
    // Ignoring all updates about ongoing deployment
    // We only want to send update once a deployment is done
    return;
  }
  const object = deploymentObject.object;
  const metadata = object.metadata;
  logger.debug(`Handling deployment event: ${deploymentObject.type} - ${metadata.namespace}/${metadata.name}`);

  updateConsul(deploymentObject);
  updateServiceRegistry(deploymentObject);
  updateVersionService(deploymentObject);
}

class DeploymentOperator extends Operator {
  constructor() {
    super(logger);
  }

  async init() {
    await this.watchResource('apps', 'v1', 'deployments', async event => {
      const object = event.object;
      const metadata = object.metadata;
      switch (event.type) {
        case ResourceEventType.Added:
        case ResourceEventType.Modified:
        case ResourceEventType.Deleted:
          if (env.KUBERNETES_NAMESPACES.split(',').includes(metadata.namespace)) {
            logger.trace(`Event received: ${event.type} - ${metadata.namespace}/${metadata.name}`);
            onDeploymentChange(event);
          }
          break;
        default:
          logger.trace(`Event received, but ignored: ${event.type} - ${metadata.namespace}/${metadata.name}`);
          break;
      }
    });
  }
}

module.exports = {
  DeploymentOperator,
};
