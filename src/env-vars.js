const envalid = require('envalid')
const logger = require('ww-logging').logger();
const { str, num, bool } = envalid;

const env = envalid.cleanEnv(process.env, {
  SERVICE_REGISTRY_URL: str(),
  KUBERNETES_MASTER_URL: str(),
  KUBERNETES_NAMESPACE: str(),
  KUBERNETES_USERNAME: str(),
  KUBERNETES_PASSWORD: str(),
});

logger.info('Required environment variables are present');

module.exports = env;
