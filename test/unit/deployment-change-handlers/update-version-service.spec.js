const test = require('tape');
const proxyquire = require('proxyquire').noCallThru();

test('update-version-service', t => {
  t.test('that when a deployment changes then the service details are retrieved, the current version is retrieved and stored in the version service', assert => {
    assert.plan(5);

    const fakeDeployment = {
      object: {
        metadata: {
          labels: {
            app: 'fakeServiceName',
          },
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironments = [
      {
        _id: 'fakeNamespace',
        baseUrl: 'http://bob2',
      },
    ];

    const fakeLinks = [
      {
        _id: 'ping',
        url: '/fakePing',
      },
    ];

    const fakeService = {
      _id: 'fakeServiceName',
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: fakeLinks,
      environments: fakeEnvironments,
    };

    const { updateVersionService } = proxyquire('../../../src/deployment-change-handlers/update-version-service', {
      '../registry-client/get-service': {
        getService: serviceName => {
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeService);
        },
      },
      '../ping-client/get-ping': {
        getPing: url => {
          assert.equal(url, 'http://bob2/fakePing', 'expected the ping url generated from service');
          return Promise.resolve({ version: '0.0.97', name: 'fakeServiceName' });
        },
      },
      '../version-service-client/store-version': {
        storeVersion: (environment, serviceName, version) => {
          assert.equal(environment, 'fakeNamespace', 'expected the environment');
          assert.equal(serviceName, 'fakeServiceName', 'expected the serviceName');
          assert.equal(version, '0.0.97', 'expected the version retrieved from get ping');
          return Promise.resolve();
        },
      },
    });

    updateVersionService(fakeDeployment);
  });

  t.test('that when a deployment changes then the service details are retrieved where there are multiple versions and links, the current version is retrieved and stored in the version service', assert => {
    assert.plan(5);

    const fakeDeployment = {
      object: {
        metadata: {
          labels: {
            app: 'fakeServiceName',
          },
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironments = [
      {
        _id: 'env1',
        baseUrl: 'http://bob1',
      }, {
        _id: 'fakeNamespace',
        baseUrl: 'http://bob2',
      },
    ];

    const fakeLinks = [
      {
        _id: 'fakeLink1',
        url: '/fakeUrl1',
      },
      {
        _id: 'ping',
        url: '/fakePing',
      },
    ];

    const fakeService = {
      _id: 'fakeServiceName',
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: fakeLinks,
      environments: fakeEnvironments,
    };

    const { updateVersionService } = proxyquire('../../../src/deployment-change-handlers/update-version-service', {
      '../registry-client/get-service': {
        getService: serviceName => {
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeService);
        },
      },
      '../ping-client/get-ping': {
        getPing: url => {
          assert.equal(url, 'http://bob2/fakePing', 'expected the ping url generated from service');
          return Promise.resolve({ version: '0.0.97', name: 'fakeServiceName' });
        },
      },
      '../version-service-client/store-version': {
        storeVersion: (environment, serviceName, version) => {
          assert.equal(environment, 'fakeNamespace', 'expected the environment');
          assert.equal(serviceName, 'fakeServiceName', 'expected the serviceName');
          assert.equal(version, '0.0.97', 'expected the version retrieved from get ping');
          return Promise.resolve();
        },
      },
    });

    updateVersionService(fakeDeployment);
  });

  t.test('that when a deployment changes then the service details are retrieved without a baseUrl for the given environment then nothing is pinged or stored', assert => {
    assert.plan(1);

    const fakeDeployment = {
      object: {
        metadata: {
          labels: {
            app: 'fakeServiceName',
          },
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironments = [
      {
        _id: 'env1',
        baseUrl: 'http://bob1',
      }, {
        _id: 'fakeNamespace',
      },
    ];

    const fakeLinks = [
      {
        _id: 'fakeLink1',
        url: '/fakeUrl1',
      },
      {
        _id: 'ping',
        url: '/fakePing',
      },
    ];

    const fakeService = {
      _id: 'fakeServiceName',
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: fakeLinks,
      environments: fakeEnvironments,
    };

    const { updateVersionService } = proxyquire('../../../src/deployment-change-handlers/update-version-service', {
      '../registry-client/get-service': {
        getService: serviceName => {
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeService);
        },
      },
      '../ping-client/get-ping': {
        getPing: () => {
          assert.fail('should not call get-ping');
          return Promise.resolve({ version: '0.0.97', name: 'fakeServiceName' });
        },
      },
      '../version-service-client/store-version': {
        storeVersion: () => {
          assert.fail('should not call store-version');
          return Promise.resolve();
        },
      },
    });

    updateVersionService(fakeDeployment);
  });

  t.test('that when a deployment changes then the service details are retrieved without a ping link then nothing is pinged or stored', assert => {
    assert.plan(1);

    const fakeDeployment = {
      object: {
        metadata: {
          labels: {
            app: 'fakeServiceName',
          },
          namespace: 'fakeNamespace',
        },
      },
    };

    const fakeEnvironments = [
      {
        _id: 'env1',
        baseUrl: 'http://bob1',
      }, {
        _id: 'fakeNamespace',
        baseUrl: 'http://bob2',
      },
    ];

    const fakeLinks = [
      {
        _id: 'fakeLink1',
        url: '/fakeUrl1',
      },
    ];

    const fakeService = {
      _id: 'fakeServiceName',
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: fakeLinks,
      environments: fakeEnvironments,
    };

    const { updateVersionService } = proxyquire('../../../src/deployment-change-handlers/update-version-service', {
      '../registry-client/get-service': {
        getService: serviceName => {
          assert.equal(serviceName, 'fakeServiceName', 'expected serviceName to be passed through');
          return Promise.resolve(fakeService);
        },
      },
      '../ping-client/get-ping': {
        getPing: () => {
          assert.fail('should not call get-ping');
          return Promise.resolve({ version: '0.0.97', name: 'fakeServiceName' });
        },
      },
      '../version-service-client/store-version': {
        storeVersion: () => {
          assert.fail('should not call store-version');
          return Promise.resolve();
        },
      },
    });

    updateVersionService(fakeDeployment);
  });
});
