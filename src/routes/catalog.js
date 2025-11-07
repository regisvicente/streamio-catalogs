const express = require('express');
const router = express.Router();
const cache = require('../cache/store');
const { fetchFreshCatalog } = require('../services/catalogService');

router.get('/catalog/:type/:id.json', async (req, res) => {
  try {
    const { type, id } = req.params;        
    const { search = '', skip = 0 } = req.query;

    if (!['movie', 'series'].includes(type)) {
      return res.status(400).json({ err: 'Tipo inválido' });
    }
    
    const { data } = await cache.getOrRefresh(fetchFreshCatalog);

    const key = type === 'movie' ? 'movies' : 'series';
    const byProvider = data[key] || {};

    let metas = byProvider[id] || [];

    // filtro de busca
    if (search) {
      const q = String(search).toLowerCase();
      metas = metas.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q)
      );
    }

    // paginação
    const start = Number(skip) || 0;
    const pageSize = 50;
    metas = metas.slice(start, start + pageSize);

    // cache HTTP
    res.setHeader('Cache-Control', 'max-age=300, public');

    // resposta no formato que o Stremio espera
    res.json({ metas });
  } catch (err) {
    console.error('[CATALOG] Erro ao montar catálogo:', err);
    res.status(500).json({ err: 'Erro interno no catálogo' });
  }
});

module.exports = router;
