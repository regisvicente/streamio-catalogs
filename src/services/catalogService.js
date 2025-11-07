
async function fetchFreshCatalog() {


  // TODO: trocar por fetch real (TMDB/DB/etc)
  const movies = {
    'demo:matrix': {
      id: 'demo:matrix regis', type: 'movie', name: 'The Matrix (Demo)',
      poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      releaseInfo: '1999', description: 'Exemplo de item do catálogo.'
    },
    'demo:spirited-away': {
      id: 'demo:spirited-away', type: 'movie', name: 'Spirited Away (Demo)',
      poster: 'https://image.tmdb.org/t/p/w342/oRvMaJOmapypFUcQqpgHMZA6qL9.jpg',
      releaseInfo: '2001'
    }
  };

  const series = {}; // se não usar, mantenha vazio

  return { movies, series };
}

module.exports = { fetchFreshCatalog };
