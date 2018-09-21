const test = require('tape');
const proxyquire = require('proxyquire').noCallThru();

test('that the correct params are sent to the get deployment api call', t => {
  t.plan(5);

  function FakeStream() {
    this.on = function () {
      return this;
    };
    this.pipe = function (jsonStream) {
      jsonStream.on('data', () => { });
    };
  }

  function FakeDeployments() {
    this.get = function (params) {
      t.equals(params.qs.watch, true, 'expected to request web socket');
      return new FakeStream();
    };
  }

  function FakeNs() {
    this.deployments = new FakeDeployments();
  }

  function fakeExtentions(options) {
    t.equals(options.url, 'test-masterUrl', 'expected url to be passed through');
    t.equals(options.namespace, 'test-namespace', 'expected namespace to be passed through');
    t.equals(options.auth.user, 'test-username', 'expected username to be passed through');
    t.equals(options.auth.pass, 'test-password', 'expected password to be passed through');
    this.ns = new FakeNs();
  }

  const { listenForDeployments } = proxyquire('../../../src/kubernetes-client/deployment-listener', {
    'kubernetes-client': {
      Extensions: fakeExtentions,
    },
  });

  listenForDeployments('test-masterUrl', 'test-namespace', 'test-username', 'test-password', object => object);
});
