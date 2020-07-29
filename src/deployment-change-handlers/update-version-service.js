const logger = require('../logger');

const { getService } = require('../registry-client/get-service');
const { getPing } = require('../ping-client/get-ping');
const { storeVersion } = require('../version-service-client/store-version');

function retrieveBaseUrlFor(environmentName, service) {
  let baseUrl = null;
  if (service.environments != null) {
    service.environments.forEach(environment => {
      if (environment._id === environmentName) {
        if (environment.baseUrl != null) {
          baseUrl = environment.baseUrl;
          logger.debug(`Retrieved base url [${environmentName}/${service._id}]: ${baseUrl}`);
        }
      }
    });
  }
  return baseUrl;
}

function retrievePingUrlFor(service) {
  let url = null;
  if (service.links != null) {
    service.links.forEach(link => {
      if (link._id === 'ping') {
        if (link.url != null) {
          url = link.url;
          logger.debug(`Retrieved ping url [${service._id}]: ${url}`);
        }
      }
    });
  }
  return url;
}

const updateVersionService = (deploymentObject => {
  const environment = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.labels.app;
  logger.debug(`Query version for ${environment}/${serviceName}`);

  const servicePromise = getService(serviceName);
  servicePromise.then(service => {
    logger.trace(`Retrieved service [${environment}/${serviceName}]: ${JSON.stringify(service)}`);
    const baseUrl = retrieveBaseUrlFor(environment, service);
    const pingUrl = retrievePingUrlFor(service);
    if (baseUrl == null || pingUrl == null) {
      logger.debug(`Not enough information to ping service [${environment}/${serviceName}]`);
    } else {
      const fullPingUrl = baseUrl + pingUrl;
      getPing(fullPingUrl)
        .then(pingResponse => {
          const pingResponseString = JSON.stringify(pingResponse) || pingResponse;
          if (pingResponse.version != null) {
            logger.debug(`Success pinging service [${fullPingUrl}]: ${pingResponseString}`);
            storeVersion(environment, serviceName, pingResponse.version)
              .then(() => {
                logger.debug(`Success stored version [${environment}/${serviceName}] - ${pingResponse.version}`);
              })
              .catch(error => {
                logger.warn(`Error storing version for service [${environment}/${serviceName}] - ${pingResponse.version}: ${error}`);
              });
          } else {
            logger.warn(`Unable to ping service [${fullPingUrl}]: ${pingResponseString}`);
          }
        })
        .catch(error => {
          logger.warn(`Error pinging service [${fullPingUrl}]: ${error}`);
        });
    }
  }).catch(error => {
    logger.warn(`Error getting service [${environment}/${serviceName}]: ${error}`);
  });
});

module.exports = {
  updateVersionService,
};
