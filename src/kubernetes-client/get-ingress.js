const { Extensions } = require('kubernetes-client');

const getIngress = ((masterUrl, namespace, username, password, ingressName) => {
  const ext = new Extensions({
    url: masterUrl,
    version: 'v1beta1',
    namespace,
    insecureSkipTlsVerify: true,
    auth: {
      user: username,
      pass: password,
    },
  });

  return new Promise(((resolve, reject) => {
    ext.ns.ingress(ingressName).get((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }));
});

module.exports = {
  getIngress,
};
