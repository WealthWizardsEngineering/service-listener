const logger = require('ww-logging').logger();

const { getService } = require('../registry-client/get-service');
const { getPing } = require('../ping-client/get-ping');
const { storeVersion } = require('../version-service-client/store-version');

const updateVersionService = ((deploymentObject) => {
  const environment = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.name;
  logger.info(`Query version for ${environment}/${serviceName}`);

  const servicePromise = getService(serviceName);
  servicePromise.then((service) => {
    logger.info(`here we are: ${service.environments.length}`);
    const baseUrl = retrieveBaseUrlFor(environment, service);
    const pingUrl = retrievePingUrlFor(service);
    logger.info(`baseUrl: ${baseUrl}`);
    if (baseUrl == null || pingUrl == null) {
      logger.info('here we are2');

    } else {
      const fullPingUrl = baseUrl + pingUrl;
      getPing(fullPingUrl)
        .then((pingResponse) => {
          var pingResponseString = JSON.stringify(pingResponse) || pingResponse;
          if (pingResponse.version != null) {
            logger.info(`Success pinging service [${fullPingUrl}]: ${pingResponseString}`);
            storeVersion(environment, serviceName, pingResponse.version)
              .then(() => {
                logger.debug(`Success stored version [${environment}/${serviceName}] - ${pingResponse.version}`);
              })
              .catch((error) => {
                logger.error(`Error storing version for service [${environment}/${serviceName}] - ${pingResponse.version}: ${error}`);
              });
          } else {
            logger.warn(`Error pinging service [${fullPingUrl}]: ${pingResponseString}`);
          }
        })
        .catch((error) => {
          logger.warn(`Error pinging service [${fullPingUrl}]: ${error}`);
        });
    }
  });
});

function retrieveBaseUrlFor(environmentName, service) {
  var baseUrl = null;
  if (service.environments != null) {
    service.environments.forEach((environment) => {
      if (environment._id === environmentName) {
        if (environment.baseUrl != null) {
          baseUrl = environment.baseUrl;
          logger.info(baseUrl);
        }
      }
    });
  }
  logger.info(baseUrl);
  return baseUrl;
}

function retrievePingUrlFor(service) {
  var url = null;
  if (service.links != null) {
    service.links.forEach((link) => {
      if (link._id === 'ping') {
        if (link.url != null) {
          url = link.url;
          logger.info(url);
        }
      }
    });
  }
  logger.info(url);
  return url;
}

module.exports = {
  updateVersionService,
};
