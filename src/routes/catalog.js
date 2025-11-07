const express = require('express');
const router = express.Router();
const { fetchFreshCatalog } = require('../services/catalogService');

router.get('/catalog/:type/:id*.json', async (req, res) => {
  try {
    const { type, id } = req.params;
    const extraPath = req.params[0] || '';
    const skipMatch = extraPath.match(/skip=(\d+)/);
    const skip = skipMatch ? Number(skipMatch[1]) : Number(req.query.skip) || 0;

    const search = req.query.search || '';

    const offset = Number(skip) || 0;

    if (!['movie', 'series'].includes(type)) {
      return res.status(400).json({ err: 'Tipo inválido' });
    }

    const typeQuery = type === 'movie' ? 'MOVIE' : 'SHOW';

    let metas = await fetchFreshCatalog(typeQuery, id, offset);

    // filtro de busca
    if (search) {
      const q = String(search).toLowerCase();
      metas = metas.filter(m =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q)
      );
    }

    // cache HTTP
    res.setHeader('Cache-Control', 'max-age=300, public');
    res.json({ metas });
  } catch (err) {
    console.error('[CATALOG] Erro ao montar catálogo:', err);
    res.status(500).json({ err: 'Erro interno no catálogo' });
  }
});

module.exports = router;
