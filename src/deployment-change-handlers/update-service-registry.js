const logger = require('../logger');
const env = require('../env-vars');

const { getIngress } = require('../kubernetes-client/get-ingress');
const { storeService } = require('../registry-client/store-service');

function extractLinksFrom(annotations) {
  const links = [];
  if (annotations != null) {
    const annotationKeys = Object.keys(annotations);
    annotationKeys.forEach(annotationKey => {
      const index = annotationKey.indexOf('-');
      if (index > -1) {
        const type = annotationKey.substr(0, index);
        if (type === 'link') {
          const name = annotationKey.substr(index + 1, annotationKey.size);
          links.push({ _id: name, url: annotations[annotationKey] });
        }
      }
    });
  }
  return links;
}

function extractTagsFrom(annotations) {
  if (annotations == null || annotations.tags == null) {
    return null;
  }
  return annotations.tags.split(',');
}

function addDefaultLink(links, name, defaultUrl) {
  let needsLink = true;
  links.forEach((link, index, object) => {
    if (link._id === name) {
      needsLink = false;
      if (link.url === 'false' || link.url === false) {
        object.splice(index, 1);
      }
    }
  });
  if (needsLink) {
    links.push({ _id: name, url: defaultUrl });
  }
}

function addDefaultLinks(links) {
  addDefaultLink(links, 'ping', '/ping');
  addDefaultLink(links, 'health', '/health');
}

function createService(namespace, serviceName, links, tags, baseUrl = null) {
  let environment;
  if (baseUrl == null) {
    environment = {
      _id: namespace,
    };
  } else {
    environment = {
      _id: namespace,
      baseUrl,
    };
  }

  storeService(serviceName, environment, links, tags)
    .then(() => {
      logger.debug(`Service ${environment}/${serviceName} stored OK`);
    })
    .catch(error => {
      logger.warn(`Service ${serviceName} failed to be stored: ${error}`);
    });
}

const updateServiceRegistry = (deploymentObject => {
  const { namespace } = deploymentObject.object.metadata;
  const serviceName = deploymentObject.object.metadata.name;
  const links = extractLinksFrom(deploymentObject.object.metadata.annotations);
  const tags = extractTagsFrom(deploymentObject.object.metadata.annotations);

  getIngress(
    env.KUBERNETES_MASTER_URL,
    env.KUBERNETES_NAMESPACE,
    env.KUBERNETES_USERNAME,
    env.KUBERNETES_PASSWORD,
    serviceName
  )
    .then(response => {
      let baseUrl = `https://${response.spec.rules[0].host}`;
      if (response.spec.rules[0].http.paths[0].path !== '/') {
        baseUrl += response.spec.rules[0].http.paths[0].path;
      }
      logger.debug(`Base URL for ${serviceName}: ${baseUrl}`);
      addDefaultLinks(links);
      createService(namespace, serviceName, links, tags, baseUrl);
    })
    .catch(error => {
      logger.info(`Unable to retrieve base URL for ${serviceName}, perhaps this service does not have an ingress controller: ${error}`);
      createService(namespace, serviceName, links, tags);
    });
});

module.exports = {
  updateServiceRegistry,
};
