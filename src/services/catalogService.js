const axios = require('axios');

const PAGE_SIZE = 20;

async function fetchFreshCatalog(type, providerId, offset = 0) {
  const country = 'BR';
  const language = 'pt';
  const providers = [providerId];

  try {
    const res = await axios.post('https://apis.justwatch.com/graphql', {
      "operationName": "GetPopularTitles",
      "variables": {
        "popularTitlesSortBy": "TRENDING",
        "first": PAGE_SIZE,
        "platform": "WEB",
        "sortRandomSeed": 0,
        "popularAfterCursor": "",
        "offset": offset,
        "popularTitlesFilter": {
          "ageCertifications": [],
          "excludeGenres": [],
          "excludeProductionCountries": [],
          "genres": [],
          "objectTypes": [
            type
          ],
          "productionCountries": [],
          "packages": providers,
          "excludeIrrelevantTitles": false,
          "presentationTypes": [],
          "monetizationTypes": []
        },
        "language": language,
        "country": country
      },
      "query": "query GetPopularTitles(\n  $country: Country!\n  $popularTitlesFilter: TitleFilter\n  $popularAfterCursor: String\n  $popularTitlesSortBy: PopularTitlesSorting! = POPULAR\n  $first: Int!\n  $language: Language!\n  $offset: Int = 0\n  $sortRandomSeed: Int! = 0\n  $profile: PosterProfile\n  $backdropProfile: BackdropProfile\n  $format: ImageFormat\n) {\n  popularTitles(\n    country: $country\n    filter: $popularTitlesFilter\n    offset: $offset\n    after: $popularAfterCursor\n    sortBy: $popularTitlesSortBy\n    first: $first\n    sortRandomSeed: $sortRandomSeed\n  ) {\n    totalCount\n    pageInfo {\n      startCursor\n      endCursor\n      hasPreviousPage\n      hasNextPage\n      __typename\n    }\n    edges {\n      ...PopularTitleGraphql\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment PopularTitleGraphql on PopularTitlesEdge {\n  cursor\n  node {\n    id\n    objectId\n    objectType\n    content(country: $country, language: $language) {\n      externalIds {\n        imdbId\n      }\n      title\n      fullPath\n      scoring {\n        imdbScore\n        __typename\n      }\n      posterUrl(profile: $profile, format: $format)\n      ... on ShowContent {\n        backdrops(profile: $backdropProfile, format: $format) {\n          backdropUrl\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}"
    })

    const edges = res?.data?.data?.popularTitles?.edges;
    if (!Array.isArray(edges)) {
      console.error('Resposta inesperada do JustWatch: edges ausente');
      return [];
    }

    const items = await Promise.all(
      edges.map(async (item) => {
        const content = item?.node?.content;
        const imdbId = content?.externalIds?.imdbId;

        if (!imdbId) {
          return null;
        }

        // tenta extrair poster do JustWatch
        const posterId = content?.posterUrl
          ?.match(/\/poster\/([0-9]+)\//)
          ?.pop();

        let posterUrl = posterId
          ? `https://images.justwatch.com/poster/${posterId}/s332/img`
          : `https://live.metahub.space/poster/medium/${imdbId}/img`;

        const stremioType = type === 'MOVIE' ? 'movie' : 'series';

        try {
          const tmdbKey = process.env.TMDB_API_KEY;
          const tmdbUrl = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&language=pt-BR&external_source=imdb_id`;

          const [themoviedb, cinemeta] = await Promise.all([
            tmdbKey ? axios.get(tmdbUrl) : Promise.resolve({ data: {} }),
            axios
              .get(`https://v3-cinemeta.strem.io/meta/${stremioType}/${imdbId}.json`)
              .catch(() => ({ data: {} }))
          ]);

          const tmdbData = themoviedb.data || {};
          const metaMovieDB =
            (stremioType === 'movie'
              ? tmdbData.movie_results?.[0]
              : tmdbData.tv_results?.[0]) || null;

          const cinemetaMeta = cinemeta.data?.meta || {};

          const title =
            metaMovieDB?.title ||
            metaMovieDB?.name ||
            content.title;

          const description =
            metaMovieDB?.overview ||
            cinemetaMeta.description ||
            'Descrição não disponível.';

          if (metaMovieDB?.poster_path) {
            posterUrl = `https://image.tmdb.org/t/p/w342${metaMovieDB.poster_path}`;
          }

          return {
            ...cinemetaMeta,
            id: imdbId,
            type: stremioType,
            name: title,
            poster: posterUrl,
            description,
            videos: undefined // evita lista gigante do cinemeta
          };
        } catch (err) {
          console.error(`Erro ao buscar dados extras para ${imdbId}:`, err.message);

          return {
            id: imdbId,
            type: stremioType,
            name: content.title,
            poster: posterUrl,
            posterShape: 'poster'
          };
        }
      })
    );

    return items.filter((m) => m && m.id);
  } catch (e) {
    console.error('Erro na requisição ao JustWatch:', e.message);
    return [];
  }
}

module.exports = { fetchFreshCatalog };
