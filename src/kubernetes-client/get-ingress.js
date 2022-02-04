const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.NetworkingV1Api);

async function getIngress(namespace, ingressName) {
  return k8sApi.readNamespacedIngress(ingressName, namespace);
}

module.exports = {
  getIngress,
};
