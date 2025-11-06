const app = require('../src/app');

// Vercel espera um export default (CommonJS: module.exports = handler)
module.exports = (req, res) => {
  return app(req, res);
};

// Dica: se preferir ESM, teria que `export default` e usar import no app.
