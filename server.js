const app = require('./src/app');

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Local:     http://localhost:${port}`);
  console.log(`Manifest:  http://localhost:${port}/manifest.json`);
});
