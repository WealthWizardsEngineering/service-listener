const Client = require('kubernetes-client').Client;

async function getIngress(masterUrl, namespace, username, password, ingressName) {
  const client = new Client({
    config: {
      url: masterUrl,
      insecureSkipTlsVerify: true,
      auth: {
        user: username,
        pass: password,
      },
    },
    version: '1.10',
  });
  return client.apis.extensions.v1beta1.namespaces(namespace).ingresses(ingressName).get();
}

module.exports = {
  getIngress,
};
