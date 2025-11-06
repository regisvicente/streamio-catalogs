const BASE_URL = process.env.BASE_URL || ''; // defina na Vercel p/ URL do deploy
const ADDON_NAME = 'Meu Add-on (Vercel)';
const ADDON_ID = 'org.example.vercel.addon';

module.exports = { BASE_URL, ADDON_NAME, ADDON_ID };
