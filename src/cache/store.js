const fs = require('fs');
const path = require('path');

const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 6 * 60 * 60 * 1000); // 6 horas
//const CACHE_DIR = process.env.CACHE_DIR || '/tmp';
const CACHE_DIR = './cache';
const CACHE_FILE = path.join(CACHE_DIR, 'catalog-cache.json');


let mem = { ts: 0, movies: {}, series: {} };

let inFlight = null;

function isValid(ts) {
  return ts && (Date.now() - ts) < CACHE_TTL_MS;
}

function ensureDir() {
  try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch {}
}

function readDisk() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.log('[cache] Erro lendo disco:', e.message);
  }
  return null;
}

function writeDisk(data) {
  try {
    ensureDir();
    const tmp = CACHE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, CACHE_FILE); // “commit” atômico
  } catch (e) {
    console.log('[cache] Erro salvando disco:', e.message);
  }
}

function load() {
  // 1) RAM
  if (isValid(mem.ts)) {
    return { movies: mem.movies || {}, series: mem.series || {} };
  }

  // 2) Disco
  const file = readDisk();
  if (file && isValid(file.timestamp)) {
    mem = { ts: file.timestamp, movies: file.movies || {}, series: file.series || {} };
    return { movies: mem.movies, series: mem.series };
  }
  return null;
}

function save(movies, series) {
  const data = { timestamp: Date.now(), movies, series };
  mem = { ts: data.timestamp, movies, series };
  writeDisk(data);
}

async function getOrRefresh(fetchFresh) {
  const cached = load();
  if (cached) return { data: cached, from: 'cache' };
  
  
  if (inFlight) {
    await inFlight; 
    return { data: load(), from: 'race' };
  }

  inFlight = (async () => {
    const fresh = await fetchFresh();
    save(fresh.movies || {}, fresh.series || {});
    return fresh;
  })();

  try {
    const fresh = await inFlight;
    return { data: fresh, from: 'fresh' };
  } finally {
    inFlight = null;
  }
}

module.exports = { load, save, getOrRefresh };
