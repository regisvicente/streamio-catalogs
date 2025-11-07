const express = require('express');
const cors = require('cors');

const health = require('./routes/health');
const manifest = require('./routes/manifest');
const catalog = require('./routes/catalog');
const homepage = require('./routes/homepage');

const app = express();
app.set('trust proxy', true);
app.use(cors());

// rotas
app.use(health);
app.use(manifest);
app.use(catalog);
app.use(homepage);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// exporta o app para ser usado no server local e no handler da Vercel
module.exports = app;
