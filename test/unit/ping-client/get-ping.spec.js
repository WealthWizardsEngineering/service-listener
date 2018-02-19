const test = require('tape');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

test('that the ping endpoint can be queried', t => {

  t.plan(2);
  const sandbox = sinon.sandbox.create();
  const requestStub = sandbox.stub().resolves();

  const { getPing } = proxyquire('../../../src/ping-client/get-ping', {
    'request-promise-native': requestStub,
  });

  getPing('http://my-host/my-service/ping')
    .then(() => {
    t.equals(requestStub.callCount, 1, 'API called once');
    t.deepEquals(
      requestStub.args[0][0],
      {
        url: 'http://my-host/my-service/ping',
        method: 'GET',
        json: true,
      },
      'GET request is correct'
    );
  });
});
