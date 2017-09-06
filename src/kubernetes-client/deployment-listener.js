const Api = require('kubernetes-client');
const JSONStream = require('json-stream');
const logger = require('ww-logging').logger();

const listenForDeployments = ((masterUrl, namespace, username, password, onChange) =>
{
  const ext = new Api.Extensions({
    url: masterUrl,
    version: 'v1beta1',
    namespace: namespace,
    insecureSkipTlsVerify: true,
    auth: {
      user: username,
      pass: password
    }
  });

  const jsonStream = new JSONStream();
  const stream = ext.ns.deployments.get({qs: {watch: true}});
  stream.on('error', function(err) {
    logger.toInvestigateTomorrow(`There was a problem with the Kubernetes deployment websocket: ${err}`);
  }).pipe(jsonStream);
  jsonStream.on('data', object => onChange(object));
});

module.exports = {
  listenForDeployments,
};

