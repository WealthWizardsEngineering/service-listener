const JSONStream = require('json-stream');
const logger = require('../logger');

function listenForDeployments(client, namespace, onDeploymentChange) {
  logger.debug(`Listening for deployments in ${namespace}`);

  const stream = client.apis.apps.v1.watch.namespaces(namespace).deployments.getStream();
  const jsonStream = new JSONStream();
  stream.pipe(jsonStream);

  stream.on('end', () => {
    listenForDeployments(client, namespace, onDeploymentChange);
  });
  jsonStream.on('error', err => {
    logger.error('Error occurred during watching', err);
    listenForDeployments(client, namespace, onDeploymentChange);
  });
  jsonStream.on('data', object => {
    logger.debug(`Event received: ${object.type} - ${object.object.metadata.namespace}/${object.object.metadata.labels.app}`);
    onDeploymentChange(object);
  });
}

module.exports = {
  listenForDeployments,
};
