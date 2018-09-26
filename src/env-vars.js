const envalid = require('envalid');
const logger = require('./logger');

const { str } = envalid;

const env = envalid.cleanEnv(process.env, {
  SERVICE_REGISTRY_URL: str(),
  KUBERNETES_MASTER_URL: str(),
  KUBERNETES_NAMESPACES: str(),
  KUBERNETES_USERNAME: str(),
  KUBERNETES_PASSWORD: str(),
  VERSION_SERVICE_URL: str(),
});

logger.info('Required environment variables are present');

module.exports = env;
