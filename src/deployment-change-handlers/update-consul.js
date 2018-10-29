const consul = require('consul');
const env = require('../env-vars');
const logger = require('../logger');

const client = consul({
  host: env.CONSUL_ADDR,
  port: env.CONSUL_PORT,
  secure: env.CONSUL_SECURE,
  defaults: {
    token: env.CONSUL_TOKEN,
  },
});

const updateConsul = (deploymentObject => {
  if (typeof env.CONSUL_ADDR !== 'undefined' && env.CONSUL_ADDR) {
    const updateType = deploymentObject.type;
    const { namespace } = deploymentObject.object.metadata;
    const serviceName = deploymentObject.object.metadata.labels.app;
    const variant = deploymentObject.object.spec.template.metadata.labels.version;
    if (typeof variant !== 'undefined' && variant) {
      if (updateType === 'ADDED') {
        logger.debug(`Storing deployment in consul: ${namespace} ${serviceName} ${variant}`);
        client.kv.set(`deployment_registry/${namespace}/${serviceName}/${variant}`, '', err => {
          if (err) throw err;
          logger.debug('Stored successfully');
        });
      } else if (updateType === 'DELETED') {
        logger.debug(`Deleting deployment in consul: ${namespace} ${serviceName} ${variant}`);
        client.kv.del(`deployment_registry/${namespace}/${serviceName}/${variant}`, err => {
          if (err) throw err;
          logger.debug('Deleted successfully');
        });
      }
    }
  }
});

module.exports = {
  updateConsul,
};
