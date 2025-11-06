const express = require('express');
const router = express.Router();

router.get('/stream/:type/:id.json', (req, res) => {
  const { type, id } = req.params;
  if (type !== 'movie') return res.json({ streams: [] });

  let streams = [];
  if (id === 'demo:matrix') {
    streams = [{ title: '1080p (Demo)', url: 'https://example.com/demo/matrix-1080p.mp4' }];
  } else if (id === 'demo:spirited-away') {
    streams = [{ title: '720p (Demo)', url: 'https://example.com/demo/spirited-away-720p.mp4' }];
  }

  res.setHeader('Cache-Control', 'max-age=60, public');
  res.json({ streams });
});

module.exports = router;
