const { ADDON_ID, ADDON_NAME } = require('../config');

const PROVIDERS = [
  { id: 'nfx', name: 'Netflix' },
  { id: 'amp', name: 'Prime Video' },
  { id: 'pmp', name: 'Paramount+' },
  { id: 'atp', name: 'Apple TV+' },
  { id: 'dnp', name: 'Disney+' },
  { id: 'hbm', name: 'HBO Max' },
  { id: 'cru', name: 'Crunchyroll' },
];

const catalogs = PROVIDERS.flatMap(provider => ([
  { id: provider.id, type: 'movie', name: provider.name },
  { id: provider.id, type: 'series', name: provider.name },
]));

const manifestBase = {
  id: ADDON_ID,
  logo: 'https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI',
  version: process.env.npm_package_version,
  name: ADDON_NAME,
  description: 'Template de add-on Stremio em Node + Express na Vercel.',
  resources: ['catalog'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: true,
  },
  catalogs
};

module.exports = manifestBase;
