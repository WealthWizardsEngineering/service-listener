const logger = require('../logger');

const { getService } = require('../registry-client/get-service');
const { getPing } = require('../ping-client/get-ping');
const { storeVersion } = require('../version-service-client/store-version');

const updateVersionService = ((deploymentObject) => {
  const environment = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.name;
  logger.info(`Query version for ${environment}/${serviceName}`);

  const servicePromise = getService(serviceName);
  servicePromise.then((service) => {
    logger.debug(`Retrieved service [${environment}/${serviceName}]: ` + JSON.stringify(service));
    const baseUrl = retrieveBaseUrlFor(environment, service);
    const pingUrl = retrievePingUrlFor(service);
    if (baseUrl == null || pingUrl == null) {
      logger.debug(`Not enough information to ping service [${environment}/${serviceName}]`);
   } else {
      const fullPingUrl = baseUrl + pingUrl;
      getPing(fullPingUrl)
        .then((pingResponse) => {
          var pingResponseString = JSON.stringify(pingResponse) || pingResponse;
          if (pingResponse.version != null) {
            logger.debug(`Success pinging service [${fullPingUrl}]: ${pingResponseString}`);
            storeVersion(environment, serviceName, pingResponse.version)
              .then(() => {
                logger.debug(`Success stored version [${environment}/${serviceName}] - ${pingResponse.version}`);
              })
              .catch((error) => {
                logger.warn(`Error storing version for service [${environment}/${serviceName}] - ${pingResponse.version}: ${error}`);
              });
          } else {
            logger.warn(`Unable to ping service [${fullPingUrl}]: ${pingResponseString}`);
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
          logger.info(`Retrieved base url [${environmentName}/${service}]: ${baseUrl}`);
        }
      }
    });
  }
  return baseUrl;
}

function retrievePingUrlFor(service) {
  var url = null;
  if (service.links != null) {
    service.links.forEach((link) => {
      if (link._id === 'ping') {
        if (link.url != null) {
          url = link.url;
          logger.info(`Retrieved ping url [${service}]: ${url}`);
        }
      }
    });
  }
  return url;
}

module.exports = {
  updateVersionService,
};
