const test = require('tape');
const proxyquire = require('proxyquire').noCallThru();

test('that the correct params are sent to the get ingress api call', t => {

  t.plan(6);

  function fakeIngress() {
    this.get = function(promiseFunction) {
      promiseFunction(null, 'success')
    }
  }

  function fakeNs() {
    this.ingress = function(ingressName) {
      t.equals(ingressName, 'test-ingressName', 'expected ingress to be passed through');
      return new fakeIngress();
    }
  }

  function fakeExtentions(options) {
    t.equals(options.url, 'test-masterUrl', 'expected url to be passed through');
    t.equals(options.namespace, 'test-namespace', 'expected namespace to be passed through');
    t.equals(options.auth.user, 'test-username', 'expected username to be passed through');
    t.equals(options.auth.pass, 'test-password', 'expected password to be passed through');
    this.ns = new fakeNs
  }

  const { getIngress } = proxyquire('../../../src/kubernetes-client/get-ingress', {
    'kubernetes-client': {
      Extensions: fakeExtentions,
    },
  });

  getIngress('test-masterUrl', 'test-namespace', 'test-username', 'test-password', 'test-ingressName')
    .then((result) => {
      t.equals(result, 'success', 'expected success result');
    });
});
