const express = require('express');
const router = express.Router();
const { BASE_URL, ADDON_NAME } = require('../config');

router.get('/', (req, res) => {
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

module.exports = router;
