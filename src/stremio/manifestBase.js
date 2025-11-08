const { ADDON_ID, ADDON_NAME } = require('../config');

const PROVIDERS = [
  { id: 'nfx', name: 'Netflix' },
  { id: 'prv', name: 'Prime Video' },
  { id: 'pmp', name: 'Paramount+' },
  { id: 'atp', name: 'Apple TV+' },
  { id: 'dnp', name: 'Disney+' },
  { id: 'hbm', name: 'HBO Max' },
  { id: 'cru', name: 'Crunchyroll' },
];

// gêneros em ordem alfabética (label que aparece no Stremio)
const GENRES = [
  'Ação e Aventura',
  'Animação',
  'Comédia',
  'Crime',
  'Documentário',
  'Drama',
  'Esportes',
  'Europeu',
  'Família',
  'Fantasia',
  'Faroeste',
  'Ficção Científica',
  'Guerra',
  'História',
  'Mistério e Thriller',
  'Música e Musical',
  'Reality TV',
  'Romance',
  'Terror',
];

const catalogs = PROVIDERS.flatMap(provider => ([
  {
    id: provider.id,
    type: 'movie',
    name: provider.name,
    extra: [
      { name: 'search', isRequired: false },
      { name: 'genre', options: GENRES },
      { name: 'skip', isRequired: false },
    ]
  },
  {
    id: provider.id,
    type: 'series',
    name: provider.name,
    extra: [
      { name: 'search', isRequired: false },
      { name: 'genre', options: GENRES },
      { name: 'skip', isRequired: false },
    ]
  },
]));

const manifestBase = {
  id: ADDON_ID,
  logo: 'https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI',
  version: "1.0.1",
  name: ADDON_NAME,
  description: 'Streaming Catalogs - TESTE',
  resources: ['catalog'],
  types: ['movie', 'series'],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: true,
  },
  catalogs
};

module.exports = manifestBase;
