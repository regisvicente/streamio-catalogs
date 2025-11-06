const express = require('express');
const cors = require('cors')


const app = express();
app.set('trust proxy', true)
app.use(cors());
app.get('/health', (_req, res) => res.status(200).send('ok'));


// -------- Config do Add-on --------
const ADDON_NAME = 'Meu Add-on (Vercel)';
const ADDON_ID = 'org.example.vercel.addon';
const BASE_URL = process.env.BASE_URL || '';
// Dica: após deploy, defina BASE_URL como a URL do seu deploy (sem barra final), ex: https://meu-addon.vercel.app

// Manifesto mínimo compatível
const manifest = {
  id: ADDON_ID,
  version: '0.1.0',
  name: ADDON_NAME,
  description: 'Template de add-on Stremio em Node + Express na Vercel.',
  logo: `${BASE_URL}/logo.png`, // opcional; pode remover
  types: ['movie'],            // tipos atendidos
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
  idPrefixes: ['demo'] // ids que este add-on sabe resolver (opcional)
};

// -------- Dados fake (exemplo) --------
const DEMO_MOVIES = [
  {
    id: 'demo:matrix',
    type: 'movie',
    name: 'The Matrix (Demo)',
    poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    posterShape: 'regular',
    releaseInfo: '1999',
    description: 'Exemplo de item do catálogo.'
  },
  {
    id: 'demo:spirited-away',
    type: 'movie',
    name: 'Spirited Away (Demo)',
    poster: 'https://image.tmdb.org/t/p/w342/oRvMaJOmapypFUcQqpgHMZA6qL9.jpg',
    posterShape: 'regular',
    releaseInfo: '2001'
  }
];

// -------- Rotas do protocolo Stremio --------

// Manifesto
app.get(['/manifest.json', '/manifest'], (req, res) => {
  // Atualiza logo/base_url dinamicamente se soubermos a URL atual
  const origin = BASE_URL || `${req.protocol}://${req.get('host')}`;
  const dynManifest = {
    ...manifest,
    logo: `${origin}/logo.png`
  };
  res.setHeader('Cache-Control', 'max-age=3600, public');
  res.json(dynManifest);
});

// Catálogo: /catalog/:type/:id.json
// Suporta extra "search" (consulta simples) e "skip" (paginação básica).
app.get('/catalog/:type/:id.json', (req, res) => {
  const { type, id } = req.params;
  const { search = '', skip = 0 } = req.query;

  if (id !== 'demo-catalog' || type !== 'movie') {
    return res.json({ metas: [] });
  }

  let metas = DEMO_MOVIES;

  if (search) {
    const q = String(search).toLowerCase();
    metas = metas.filter(m => m.name.toLowerCase().includes(q));
  }

  const start = Number(skip) || 0;
  const pageSize = 50;
  metas = metas.slice(start, start + pageSize);

  res.setHeader('Cache-Control', 'max-age=300, public');
  res.json({ metas });
});

// Streams: /stream/:type/:id.json
// Retorna fontes de streaming para o ID informado.
app.get('/stream/:type/:id.json', (req, res) => {
  const { type, id } = req.params;

  if (type !== 'movie') return res.json({ streams: [] });

  // Exemplo simples: mapeia alguns ids "demo:*" para uma URL pública
  let streams = [];

  if (id === 'demo:matrix') {
    streams = [
      {
        title: '1080p (Demo)',
        url: 'https://example.com/demo/matrix-1080p.mp4'
      }
    ];
  } else if (id === 'demo:spirited-away') {
    streams = [
      {
        title: '720p (Demo)',
        url: 'https://example.com/demo/spirited-away-720p.mp4'
      }
    ];
  }

  res.setHeader('Cache-Control', 'max-age=60, public');
  res.json({ streams });
});

// Página simples para facilitar adicionar o add-on no Stremio
app.get('/', (req, res) => {
  const origin = BASE_URL || `${req.protocol}://${req.get('host')}`;
  const manifestUrl = `${origin}/manifest.json`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
    <html>
      <head><meta charset="utf-8"><title>${ADDON_NAME}</title></head>
      <body style="font-family: system-ui; max-width: 720px; margin: 40px auto; line-height:1.5">
        <h1>${ADDON_NAME}</h1>
        <p>URL do manifest para usar no Stremio:</p>
        <code style="padding:8px 12px; display:inline-block; background:#f5f5f5; border-radius:6px">${manifestUrl}</code>
        <p style="margin-top:16px">
          <a href="stremio://add-addon?url=${encodeURIComponent(manifestUrl)}">➕ Adicionar no Stremio</a>
        </p>
        <p style="opacity:.7">Este é um template de add-on hospedado na Vercel.</p>
      </body>
    </html>
  `);
});


// Exportar uma função handler evita qualquer incompatibilidade
module.exports = app;

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Local: http://localhost:${port}`);
  console.log(`Manifest: http://localhost:${port}/manifest.json`);
});