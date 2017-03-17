const test = require('tape');
const sinon = require('sinon');
const sinonAsPromised = require('sinon-as-promised');
const proxyquire = require('proxyquire').noCallThru();

test('that the correct params are sent to the get service api call', t => {

  t.plan(2);
  const sandbox = sinon.sandbox.create();
  const requestStub = sandbox.stub().resolves();

  const { getService } = proxyquire('../../../src/registry-client/get-service', {
    '../env-vars': {
      SERVICE_REGISTRY_URL: 'http://service-registry'
    },
    'request-promise-native': requestStub,
  });

  getService('my-service-name')
    .then(() => {
      t.equals(requestStub.callCount, 1, 'API called once');
      t.deepEquals(
        requestStub.args[0][0],
        {
          url: 'http://service-registry/v1/service/my-service-name',
          method: 'GET',
          json: true,
        },
        'GET request is correct'
      );
    });
});
