const test = require('tape');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

test('store service', t => {
  t.test('that when the service does not exist then the document is posted to the service', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const newFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: null,
      environments: [
        fakeEnvironment,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service',
            method: 'POST',
            json: true,
            body: newFakeService,
          },
          'POST request is correct'
        );
      });
  });

  t.test('that when the service already exists then the document is put to the service with the new changes', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment1 = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: null,
      tags: null,
      environments: [
        fakeEnvironment1,
      ],
    };

    const updatedFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: null,
      environments: [
        fakeEnvironment1,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment1)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });

  t.test('that when the service and environment already exists then the document is put to the service with the new changes', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const existingFakeEnvironment = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const updatedFakeEnvironment = {
      _id: 'env1',
      baseUrl: 'http://bob2',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: null,
      tags: null,
      environments: [
        existingFakeEnvironment,
      ],
    };

    const updatedFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: null,
      environments: [
        updatedFakeEnvironment,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, updatedFakeEnvironment)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });


  t.test('that when the service exists with an environment and a different environment is added then all environments should be posted', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const existingFakeEnvironment = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const updatedFakeEnvironment = {
      _id: 'env2',
      baseUrl: 'http://bob2',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: null,
      tags: null,
      environments: [
        existingFakeEnvironment,
      ],
    };

    const updatedFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: null,
      environments: [
        existingFakeEnvironment,
        updatedFakeEnvironment,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, updatedFakeEnvironment)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });

  t.test('that when the service exists without an environment and an environment is added then the new environments should be posted', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const newFakeEnvironment = {
      _id: 'env',
      baseUrl: 'http://bob',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: null,
      tags: null,
    };

    const updatedFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: null,
      environments: [
        newFakeEnvironment,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, newFakeEnvironment)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });

  t.test('that when the service does not exist then the document is posted to the service with links', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const fakeLinks = [
      {
        _id: 'fakeLink1',
        url: 'fakeUrl1',
      },
      {
        _id: 'fakeLink2',
        url: 'fakeUrl2',
      },
    ];

    const newFakeService = {
      _id: fakeServiceName,
      links: fakeLinks,
      tags: null,
      environments: [
        fakeEnvironment,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve();
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment, fakeLinks)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service',
            method: 'POST',
            json: true,
            body: newFakeService,
          },
          'POST request is correct'
        );
      });
  });

  t.test('that when the service already exists without links then the document is put to the service with the new changes including links', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment1 = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      links: null,
      tags: null,
      environments: [
        fakeEnvironment1,
      ],
    };

    const fakeLinks = [
      {
        _id: 'fakeLink1',
        url: 'fakeUrl1',
      },
      {
        _id: 'fakeLink2',
        url: 'fakeUrl2',
      },
    ];

    const updatedFakeService = {
      _id: fakeServiceName,
      links: fakeLinks,
      tags: null,
      environments: [
        fakeEnvironment1,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment1, fakeLinks)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });

  t.test('that when the service already exists with links then the document is put to the service with the new changes replacing all links', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment1 = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const existingFakeLinks = [
      {
        _id: 'oldFakeLink1',
        url: 'oldFakeUrl1',
      },
      {
        _id: 'fakeLink2',
        url: 'fakeUrl2',
      },
    ];

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      tags: null,
      links: existingFakeLinks,
      environments: [
        fakeEnvironment1,
      ],
    };

    const newFakeLinks = [
      {
        _id: 'newFakeLink1',
        url: 'newFakeUrl1',
      },
      {
        _id: 'fakeLink2',
        url: 'fakeUrl2',
      },
    ];

    const updatedFakeService = {
      _id: fakeServiceName,
      tags: null,
      links: newFakeLinks,
      environments: [
        fakeEnvironment1,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment1, newFakeLinks)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });

  t.test('that when the service already exists with tags then the document is put to the service with the new changes replacing all tags', assert => {
    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeServiceName = 'my-service-name';

    const fakeEnvironment1 = {
      _id: 'env1',
      baseUrl: 'http://bob',
    };

    const existingFakeService = {
      _id: fakeServiceName,
      __v: 0,
      createdAt: '2017-03-06T14:17:21.850Z',
      updatedAt: '2017-03-06T14:17:21.850Z',
      tags: ['oldTag1', 'oldTag2'],
      environments: [
        fakeEnvironment1,
      ],
    };

    const updatedFakeService = {
      _id: fakeServiceName,
      links: null,
      tags: ['newTag1', 'newTag2'],
      environments: [
        fakeEnvironment1,
      ],
    };

    const { storeService } = proxyquire('../../../src/registry-client/store-service', {
      './get-service': {
        getService: serviceName => {
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getService should match the service name being stored');
          return Promise.resolve(existingFakeService);
        },
      },
      '../env-vars': {
        SERVICE_REGISTRY_URL: 'http://service-registry',
      },
      'request-promise-native': requestStub,
    });

    storeService(fakeServiceName, fakeEnvironment1, null, ['newTag1', 'newTag2'])
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://service-registry/v1/service/my-service-name',
            method: 'PUT',
            json: true,
            body: updatedFakeService,
          },
          'PUT request is correct'
        );
      });
  });
});
