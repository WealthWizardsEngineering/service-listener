const env = require('../env-vars');
const logger = require('ww-logging').logger();

const { getIngress } = require('../kubernetes-client/get-ingress');
const { storeService } = require('../registry-client/store-service');

const updateServiceRegistry = ((deploymentObject) => {
  const namespace = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.name;
  const links = extractLinksFrom(deploymentObject.object.metadata.annotations);

  getIngress(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, serviceName)
    .then((response) => {
      const baseUrl = 'https://' + response.spec.rules[0].host + response.spec.rules[0].http.paths[0].path;
      logger.debug(`Base URL for ${serviceName}: ${baseUrl}`);
      addDefaultLinks (links);
      createService(namespace, serviceName, baseUrl, links);
    })
    .catch((error) => {
      logger.warn(`Unable to retrieve base URL for ${serviceName}, perhaps this service does not have an ingress controller: ${error}`);
      createService(namespace, serviceName, 'http://unknown', links);
    });

});

function createService(namespace, serviceName, baseUrl, links = null) {
  const environment = {
    _id: namespace,
    baseUrl: baseUrl
  }

  storeService(serviceName, environment, links)
    .then( () => {
      logger.debug(`Service ${environment}/${serviceName} stored OK`);
    })
    .catch( error => {
      logger.warn(`Service ${serviceName} failed to be stored: ${error}`);
    });
}

function extractLinksFrom(annotations) {
  const links = [];
  if (annotations != null) {
    const annotationKeys = Object.keys(annotations);
    annotationKeys.forEach(function(annotationKey) {
      var index = annotationKey.indexOf('-');
      if (index > -1) {
        var type = annotationKey.substr(0, index);
        if (type === 'link') {
          var name = annotationKey.substr(index + 1, annotationKey.size);
          links.push({_id: name, url: annotations[annotationKey]});
        }
      }
    });
  }
  return links;
}

function addDefaultLinks(links) {
  addDefaultLink(links, 'ping', '/ping')
  addDefaultLink(links, 'health', '/health')
}

function addDefaultLink(links, name, defaultUrl) {
  var needsLink = true;
  links.forEach(function(link) {
    if (link._id === name){
      needsLink = false;
    }
  });
  if (needsLink) {
    links.push({_id: name, url: defaultUrl})
  }
}
module.exports = {
  updateServiceRegistry,
};
