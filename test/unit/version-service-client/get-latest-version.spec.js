const test = require('tape');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

test('get-latest-version', t => {

  t.test('that the version is queries with environment and service name and returns only the first version in the list', assert => {
    assert.plan(3);

    const fakeVersionList = [
      {
        "_id": "58b3dc86e91d2a00b0a5dd0f",
        "updated_at": "2017-02-27T08:00:06.206Z",
        "date": "2017-02-27T08:00:06.206Z",
        "environment": "my-env",
        "application_name": "my-service-name",
        "version": "0.0.23",
        "product": "pension-wizard",
        "__v": 0
      },
      {
        "_id": "58b3d900e91d2a00b0a5dcde",
        "updated_at": "2017-02-27T07:45:04.405Z",
        "date": "2017-02-27T07:45:04.405Z",
        "environment": "my-env",
        "application_name": "my-service-name",
        "version": "0.0.22",
        "product": "pension-wizard",
        "__v": 0
      }
    ]

    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves(fakeVersionList);

    const { getLatestVersion } = proxyquire('../../../src/version-service-client/get-latest-version', {
      '../env-vars': {
        VERSION_SERVICE_URL: 'http://version-service'
      },
      'request-promise-native': requestStub,
    });

    getLatestVersion('my-env', 'my-service-name')
      .then((response) => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://version-service/v1/version?environment=my-env&application_name=my-service-name',
            method: 'GET',
            json: true,
          },
          'GET request is correct'
        );
        assert.deepEquals(response, fakeVersionList[0], 'unexpected response from getLatestVersion')
      });
  });

  t.test('that the version is queries with environment and service name and returns null if there are no matching versions', assert => {
    assert.plan(3);

    const fakeVersionList = []

    const sandbox = sinon.sandbox.create();
    const requestStub = sandbox.stub().resolves(fakeVersionList);

    const { getLatestVersion } = proxyquire('../../../src/version-service-client/get-latest-version', {
      '../env-vars': {
        VERSION_SERVICE_URL: 'http://version-service'
      },
      'request-promise-native': requestStub,
    });

    getLatestVersion('my-env', 'my-service-name')
      .then((response) => {
        assert.equals(requestStub.callCount, 1, 'API called once');
        assert.deepEquals(
          requestStub.args[0][0],
          {
            url: 'http://version-service/v1/version?environment=my-env&application_name=my-service-name',
            method: 'GET',
            json: true,
          },
          'GET request is correct'
        );
        assert.equals(response, null, 'unexpected response from getLatestVersion')
      });
  });

});
