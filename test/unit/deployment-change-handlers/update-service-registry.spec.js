const test = require('tape');
const proxyquire = require('proxyquire').noCallThru();

test('update-service-registry', t => {
  t.test('that when a deployment changes and there is an ingress definitions then the service registry is updated with an environment url', assert => {
    assert.plan(8);

    const fakeDeployment = {
      object: {
        metadata: {
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeIngress = {
      body: {
        spec: {
          rules: [{
            host: 'fakeHost',
            http: {
              paths: [{
                path: '/fakePath',
              }],
            },
          }],
        },
      },
    };

    const fakeEnvironment = {
      _id: 'fakeNamespace',
      baseUrl: 'https://fakeHost/fakePath',
    };

    const fakeLinks = [
      {
        _id: 'ping',
        url: '/ping',
      },
      {
        _id: 'health',
        url: '/health',
      },
    ];

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeIngress);
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment, links) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be stored');
          assert.deepEqual(links, fakeLinks, 'expected links to be stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });

  t.test('that when the ingress path is just a slash then it is not used in the baseUrl', assert => {
    assert.plan(7);

    const fakeDeployment = {
      object: {
        metadata: {
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeIngress = {
      body: {
        spec: {
          rules: [{
            host: 'fakeHost',
            http: {
              paths: [{
                path: '/',
              }],
            },
          }],
        },
      },
    };

    const fakeEnvironment = {
      _id: 'fakeNamespace',
      baseUrl: 'https://fakeHost',
    };

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeIngress);
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });

  t.test('that when a deployment changes and there is no ingress definition then no base url is stored', assert => {
    assert.plan(8);

    const fakeDeployment = {
      object: {
        metadata: {
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironment = {
      _id: 'fakeNamespace',
    };

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.reject(new Error('does not exist'));
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment, links) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be completed');
          assert.deepEqual(links, [], 'expected no links');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });

  t.test('that when a deployment changes and there are links defined as annotations then the links are stored', assert => {
    assert.plan(8);

    const fakeDeployment = {
      object: {
        metadata: {
          annotations: {
            'something-else': 'and the value',
            'link-ping': 'fake-ping',
            'link-health': 'fake-health',
            'link-to-something-else': 'fake-link',
            anotherone: 'to ignore',
          },
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironment = {
      _id: 'fakeNamespace',
    };

    const fakeLinks = [
      {
        _id: 'ping',
        url: 'fake-ping',
      },
      {
        _id: 'health',
        url: 'fake-health',
      },
      {
        _id: 'to-something-else',
        url: 'fake-link',
      },
    ];

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.reject(new Error('does not exist'));
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment, links) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be stored');
          assert.deepEqual(links, fakeLinks, 'expected links to be stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });

  t.test('that when a deployment changes and ping and health are set to false then those links are not stored', assert => {
    assert.plan(8);

    const fakeDeployment = {
      object: {
        metadata: {
          annotations: {
            'something-else': 'and the value',
            'link-ping': false,
            'link-health': false,
            'link-to-something-else': 'fake-link',
            anotherone: 'to ignore',
          },
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeIngress = {
      body: {
        spec: {
          rules: [{
            host: 'fakeHost',
            http: {
              paths: [{
                path: '/fakePath',
              }],
            },
          }],
        },
      },
    };

    const fakeEnvironment = {
      _id: 'fakeNamespace',
      baseUrl: 'https://fakeHost/fakePath',
    };

    const fakeLinks = [
      {
        _id: 'to-something-else',
        url: 'fake-link',
      },
    ];

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeIngress);
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment, links) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(environment, fakeEnvironment, 'expected the environment to be stored');
          assert.deepEqual(links, fakeLinks, 'expected links to be stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });

  t.test('that when a deployment changes and there are tags defined as annotations then the tags are stored', assert => {
    assert.plan(7);

    const fakeDeployment = {
      object: {
        metadata: {
          annotations: {
            tags: 'tag1,tag2,tag3',
          },
          name: 'fakeServiceName',
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeTags = ['tag1', 'tag2', 'tag3'];

    const { updateServiceRegistry } = proxyquire('../../../src/deployment-change-handlers/update-service-registry', {
      '../kubernetes-client/get-ingress': {
        getIngress: (masterUrl, namespace, username, password, serviceName) => {
          assert.equal(masterUrl, 'test-masterUrl', 'expected url to be passed through');
          assert.equal(namespace, 'fakeNamespace', 'expected namespace to be passed through');
          assert.equal(username, 'test-username', 'expected username to be passed through');
          assert.equal(password, 'test-password', 'expected password to be passed through');
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.reject(new Error('does not exist'));
        },
      },
      '../registry-client/store-service': {
        storeService: (serviceName, environment, links, tags) => {
          assert.equal(serviceName, 'fakeServiceName', 'expected the service name to be stored');
          assert.deepEqual(tags, fakeTags, 'expected tags to be stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        KUBERNETES_MASTER_URL: 'test-masterUrl',
        KUBERNETES_USERNAME: 'test-username',
        KUBERNETES_PASSWORD: 'test-password',
      },
    });

    updateServiceRegistry(fakeDeployment);
  });
});
