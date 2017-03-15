const test = require('tape');
const proxyquire = require('proxyquire').noCallThru();

test('that the correct params are sent to the get deployment api call', t => {

  t.plan(5);

  function fakeStream() {
    this.on = function(type, myFunction) {
      return this
    }
    this.pipe = function(jsonStream) {
      jsonStream.on('data', function() { })
    }
  }

  function fakeDeployments() {
    this.get = function(params) {
      t.equals(params.qs.watch, true, 'expected to request web socket');
      return new fakeStream
    }
  }

  function fakeNs() {
    this.deployments = new fakeDeployments
  }

  function fakeExtentions(options) {
    t.equals(options.url, 'test-masterUrl', 'expected url to be passed through');
    t.equals(options.namespace, 'test-namespace', 'expected namespace to be passed through');
    t.equals(options.auth.user, 'test-username', 'expected username to be passed through');
    t.equals(options.auth.pass, 'test-password', 'expected password to be passed through');
    this.ns = new fakeNs
  }

  const { listenForDeployments } = proxyquire('../../../src/kubernetes-client/deployment-listener', {
    'kubernetes-client': {
      Extensions: fakeExtentions,
    },
  });

  listenForDeployments('test-masterUrl', 'test-namespace', 'test-username', 'test-password', function(object) {
    return object
  });
});
