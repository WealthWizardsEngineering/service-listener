const env = require('../env-vars');
const logger = require('../logger');

const { getIngress } = require('../kubernetes-client/get-ingress');
const { storeService } = require('../registry-client/store-service');

const updateServiceRegistry = ((deploymentObject) => {
  const namespace = deploymentObject.object.metadata.namespace;
  const serviceName = deploymentObject.object.metadata.name;
  const links = extractLinksFrom(deploymentObject.object.metadata.annotations);
  const tags = extractTagsFrom(deploymentObject.object.metadata.annotations);

  getIngress(env.KUBERNETES_MASTER_URL, env.KUBERNETES_NAMESPACE, env.KUBERNETES_USERNAME, env.KUBERNETES_PASSWORD, serviceName)
    .then((response) => {
      var baseUrl = 'https://' + response.spec.rules[0].host;
      if (response.spec.rules[0].http.paths[0].path !== '/') {
        baseUrl += response.spec.rules[0].http.paths[0].path;
      }
      logger.debug(`Base URL for ${serviceName}: ${baseUrl}`);
      addDefaultLinks (links);
      createService(namespace, serviceName, links, tags, baseUrl);
    })
    .catch((error) => {
      logger.info(`Unable to retrieve base URL for ${serviceName}, perhaps this service does not have an ingress controller: ${error}`);
      createService(namespace, serviceName, links, tags);
    });

});

function createService(namespace, serviceName, links, tags, baseUrl = null) {
  var environment
  if (baseUrl == null) {
    environment = {
      _id: namespace
    }
  } else {
    environment = {
      _id: namespace,
      baseUrl: baseUrl
    }
  }

  storeService(serviceName, environment, links, tags)
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

function extractTagsFrom(annotations) {
  if (annotations == null || annotations.tags == null){
    return null;
  } else {
    return annotations.tags.split(',');
  }
}


function addDefaultLinks(links) {
  addDefaultLink(links, 'ping', '/ping')
  addDefaultLink(links, 'health', '/health')
}

function addDefaultLink(links, name, defaultUrl) {
  var needsLink = true;
  links.forEach(function(link, index, object) {
    if (link._id === name){
      needsLink = false;
      if (link.url === 'false' || link.url === false) {
        object.splice(index, 1);
      }
    }
  });
  if (needsLink) {
    links.push({_id: name, url: defaultUrl})
  }
}
module.exports = {
  updateServiceRegistry,
};
