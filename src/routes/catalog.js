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
      res.setHeader('Cache-Control', 'max-age=300, public');
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

      if (search) {
        return res.json({ metas: [] });
      } else {

        const offset = Number(skip) || 0;

        const jwGenre = genre && GENRE_CODE_BY_LABEL[genre] ? GENRE_CODE_BY_LABEL[genre] : null;

        const metas = await fetchFreshCatalog(search, type, id, jwGenre, offset);
        return res.json({ metas });
      }
    } catch (err) {
      console.error('[CATALOG] Erro ao montar catálogo:', err);
      return res.status(500).json({ err: 'Erro interno no catálogo' });
    }
  });

module.exports = router;
