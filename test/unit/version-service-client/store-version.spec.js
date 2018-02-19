const test = require('tape');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

test('store version', t => {

  t.test('that when the version does not exist it is stored', assert => {

    assert.plan(4);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeEnvironment = 'my-environment';
    const fakeServiceName = 'my-service-name';
    const fakeVersion = '0.0.4';

    const fakeVersionRecord =  {
      environment: fakeEnvironment,
      application_name: fakeServiceName,
      version: fakeVersion
    }

    const { storeVersion } = proxyquire('../../../src/version-service-client/store-version', {
      './get-latest-version': {
        getLatestVersion: (environment, serviceName) => {
          assert.equal(environment, fakeEnvironment, 'the environment passed to getLatestVersion should match the environment being stored');
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getLatestVersion should match the service name being stored');
          return Promise.resolve(null);
        },
      },
      '../env-vars': {
        VERSION_SERVICE_URL: 'http://version-service'
      },
      'request-promise-native': requestStub,
    });

    storeVersion(fakeEnvironment, fakeServiceName, fakeVersion)
      .then(() => {
      assert.equals(requestStub.callCount, 1, 'API called once');
      assert.deepEquals(
        requestStub.args[0][0],
        {
          url: 'http://version-service/v1/version',
          method: 'POST',
          json: true,
          body: fakeVersionRecord
        },
        'POST request is correct'
      );
    });
  });

  t.test('that when the latest version is the same then it is not stored', assert => {

    assert.plan(3);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeEnvironment = 'my-environment';
    const fakeServiceName = 'my-service-name';
    const fakeVersion = '0.0.4';

    const fakeVersionRecord =  {
      _id: "123456",
      updated_at: "2017-02-27T08:00:06.206Z",
      date: "2017-02-27T08:00:06.206Z",
      environment: fakeEnvironment,
      application_name: fakeServiceName,
      version: fakeVersion,
      product: "pension-wizard",
      "__v": 0
    }

    const { storeVersion } = proxyquire('../../../src/version-service-client/store-version', {
      './get-latest-version': {
        getLatestVersion: (environment, serviceName) => {
          assert.equal(environment, fakeEnvironment, 'the environment passed to getLatestVersion should match the environment being stored');
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getLatestVersion should match the service name being stored');
          return Promise.resolve(fakeVersionRecord);
        },
      },
      '../env-vars': {
        VERSION_SERVICE_URL: 'http://version-service'
      },
      'request-promise-native': requestStub,
    });

    storeVersion(fakeEnvironment, fakeServiceName, fakeVersion)
      .then(() => {
        assert.equals(requestStub.callCount, 0, 'API not called');
      });
  });

  t.test('that when the latest version is different it is stored', assert => {

    assert.plan(4);
    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves();

    const fakeEnvironment = 'my-environment';
    const fakeServiceName = 'my-service-name';
    const fakeVersion = '0.0.4';

    const existingFakeVersionRecord =  {
      _id: "123456",
      updated_at: "2017-02-27T08:00:06.206Z",
      date: "2017-02-27T08:00:06.206Z",
      environment: fakeEnvironment,
      application_name: fakeServiceName,
      version: '0.0.3',
      product: "pension-wizard",
      "__v": 0
    }

    const newFakeVersionRecord =  {
      environment: fakeEnvironment,
      application_name: fakeServiceName,
      version: fakeVersion
    }

    const { storeVersion } = proxyquire('../../../src/version-service-client/store-version', {
      './get-latest-version': {
        getLatestVersion: (environment, serviceName) => {
          assert.equal(environment, fakeEnvironment, 'the environment passed to getLatestVersion should match the environment being stored');
          assert.equal(serviceName, fakeServiceName, 'the service name passed to getLatestVersion should match the service name being stored');
          return Promise.resolve(existingFakeVersionRecord);
        },
      },
      '../env-vars': {
        VERSION_SERVICE_URL: 'http://version-service'
      },
      'request-promise-native': requestStub,
    });

    storeVersion(fakeEnvironment, fakeServiceName, fakeVersion)
      .then(() => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://version-service/v1/version',
            method: 'POST',
            json: true,
            body: newFakeVersionRecord
          },
          'POST request is correct'
        );
      });

  });

});
