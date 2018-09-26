const request = require('request-promise-native');

const getPing = pingUrl => request({
  url: `${pingUrl}`,
  method: 'GET',
  json: true,
});

module.exports = {
  getPing,
};
