const test = require('tape');
const sinon = require('sinon');
const sinonAsPromised = require('sinon-as-promised');
const proxyquire = require('proxyquire').noCallThru();

test('update-service-registry', t => {

  t.test('that when a deployment changes and there is an ingress definitions then then the service registry is updated with an environment url', assert => {

    assert.plan(7);

    const fakeDeployment = {
      object: {
        metadata: {
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        }
      }
    }

    const fakeIngress = {
      spec: {
        rules: [{
          host: 'fakeHost',
          http: {
            paths: [{
              path: '/fakePath'
            }]
          }
        }]
      }
    }

    const fakeEnvironment = {
      _id: 'fakeNamespace',
      baseUrl: 'https://fakeHost/fakePath',
    }

    const {updateServiceRegistry} = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'test-namespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeIngress);
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored')
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be completed')
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_NAMESPACE: 'test-namespace',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment)
  });


  t.test('that when a deployment changes and there is no ingress definition then an unknown base url is stored', assert => {

    assert.plan(7);

    const fakeDeployment = {
      object: {
        metadata: {
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        }
      }
    }

    const fakeEnvironment = {
      _id: 'fakeNamespace',
      baseUrl: 'http://unknown',
    }

    const {updateServiceRegistry} = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'test-namespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.reject('does not exist');
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored')
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be completed')
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_NAMESPACE: 'test-namespace',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment)
  });
});
