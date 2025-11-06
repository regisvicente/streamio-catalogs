const express = require('express');
const router = express.Router();
const DEMO_MOVIES = require('../data/demoMovies');

router.get('/catalog/:type/:id.json', (req, res) => {
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

module.exports = router;
