const express = require('express');
const router = express.Router();
const { fetchFreshCatalog } = require('../services/catalogService');

const GENRE_CODE_BY_LABEL = {
  'Ação e Aventura': 'act',
  'Animação': 'ani',
  'Comédia': 'cmy',
  'Crime': 'crm',
  'Documentário': 'doc',
  'Drama': 'drm',
  'Esportes': 'spt',
  'Europeu': 'eur',
  'Família': 'fml',
  'Fantasia': 'fnt',
  'Faroeste': 'wsn',
  'Ficção Científica': 'scf',
  'Guerra': 'war',
  'História': 'hst',
  'Mistério e Thriller': 'trl',
  'Música e Musical': 'msc',
  'Reality TV': 'rly',
  'Romance': 'rma',
  'Terror': 'hrr',
};

router.get(['/catalog/:type/:id.json',
  '/catalog/:type/:id/:query?.json'], async (req, res) => {
    try {
      const { type, id, query } = req.params;

      if (!['movie', 'series'].includes(type)) {
        return res.status(400).json({ err: 'Tipo inválido' });
      }

      let skip = "0"
      let search = null
      let genre = null

      if (query) {
        const params = new URLSearchParams(query);
        if (params.has('search')) {
          search = params.get('search');
        }
        if (params.has('skip')) {
          skip = Number(params.get('skip')) || 0;
        }
        if (params.has('genre')) {
          genre = params.get('genre');
        }
      }

      const offset = Number(skip) || 0;

      const jwGenre = genre && GENRE_CODE_BY_LABEL[genre] ? GENRE_CODE_BY_LABEL[genre] : null;

      let metas = await fetchFreshCatalog(type, id, jwGenre, offset);

      // filtro de busca
      // const search = null
      // if (search) {
      //   const q = String(search).toLowerCase();
      //   metas = metas.filter(m =>
      //     (m.name || '').toLowerCase().includes(q) ||
      //     (m.description || '').toLowerCase().includes(q)
      //   );
      // }

      // cache HTTP
      res.setHeader('Cache-Control', 'max-age=300, public');
      res.json({ metas });
    } catch (err) {
      console.error('[CATALOG] Erro ao montar catálogo:', err);
      res.status(500).json({ err: 'Erro interno no catálogo' });
    }
  });

module.exports = router;
