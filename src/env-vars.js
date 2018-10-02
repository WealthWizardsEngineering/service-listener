const envalid = require('envalid');
const logger = require('./logger');

const { str, num, bool } = envalid;

const env = envalid.cleanEnv(process.env, {
  SERVICE_REGISTRY_URL: str(),
  KUBERNETES_MASTER_URL: str(),
  KUBERNETES_NAMESPACES: str(),
  KUBERNETES_USERNAME: str(),
  KUBERNETES_PASSWORD: str(),
  VERSION_SERVICE_URL: str(),
  CONSUL_TOKEN: str({ default: undefined }),
  CONSUL_ADDR: str({ default: undefined }),
  CONSUL_PORT: num({ default: 443 }),
  CONSUL_SECURE: bool({ default: true }),
});

logger.info('Required environment variables are present');

module.exports = env;
