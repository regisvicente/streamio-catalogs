const { ADDON_ID, ADDON_NAME, BASE_URL } = require('../config');

const manifestBase = {
  id: ADDON_ID,
  version: '0.1.0',
  name: ADDON_NAME,
  description: 'Template de add-on Stremio em Node + Express na Vercel.',
  logo: `${BASE_URL}/logo.png`,
  types: ['movie'],
  resources: ['catalog', 'stream'],
  catalogs: [
    {
      id: 'demo-catalog',
      name: 'Catálogo Demo',
      type: 'movie',
      extra: [
        { name: 'search', isRequired: false },
        { name: 'skip', isRequired: false }
      ]
    }
  ],
  idPrefixes: ['demo']
};

module.exports = manifestBase;
