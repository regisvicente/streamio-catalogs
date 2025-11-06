const express = require('express');
const router = express.Router();
const manifestBase = require('../stremio/manifestBase');
const { BASE_URL } = require('../config');

router.get(['/manifest.json', '/manifest'], (req, res) => {
  const origin = BASE_URL || `${req.protocol}://${req.get('host')}`;
  const dynManifest = { ...manifestBase, logo: `${origin}/logo.png` };
  res.setHeader('Cache-Control', 'max-age=3600, public');
  res.json(dynManifest);
});

module.exports = router;
