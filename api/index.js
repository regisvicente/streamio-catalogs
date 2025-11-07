const app = require('../src/app');
const axios = require('axios');

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

module.exports = (req, res) => {
  return app(req, res);
};