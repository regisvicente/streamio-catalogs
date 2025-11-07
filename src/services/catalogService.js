const axios = require('axios');

const PAGE_SIZE = 20;

async function fetchFreshCatalog(type, providerId, offset = 0) {

  let res = null;
  const country = 'BR';
  const language = 'pt';
  const providers = [providerId]

  try {
    res = await axios.post('https://apis.justwatch.com/graphql', {
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
  } catch (e) {
    console.error(e.message);
    return [];
  }

  return (await Promise.all(res.data.data.popularTitles.edges.map(async (item, index) => {
    let imdbId = item.node.content.externalIds.imdbId;

    const posterId = item?.node?.content?.posterUrl?.match(/\/poster\/([0-9]+)\//)?.pop();
    let posterUrl;
    if (posterId) {
      posterUrl = `https://images.justwatch.com/poster/${posterId}/s332/img`;
    } else {
      posterUrl = `https://live.metahub.space/poster/medium/${imdbId}/img`;
    }

    try {
      const themoviedb = await axios.get(`https://api.themoviedb.org/3/find/${imdbId}?api_key=971041164778bac2bf0654cf97478376&language=pt-BR&external_source=imdb_id`);
      const cinemeta = await axios.get(`https://v3-cinemeta.strem.io/meta/${type === 'MOVIE' ? 'movie' : 'series'}/${imdbId}.json`);
      const description =
        themoviedb.data?.movie_results?.[0]?.overview ||
        cinemeta.data?.meta?.description ||
        "Descrição não disponível.";

      const title =
        themoviedb.data?.movie_results?.[0]?.title ||
        item.node.content.title

      return {
        ...cinemeta.data?.meta,
        ...{ id: imdbId, name: title, poster: posterUrl, videos: undefined, description },
      }

    } catch {
      console.log('erro ao pegar descriçao')
    }

    return {
      id: imdbId,
      name: item.node.content.title,
      poster: posterUrl,
      posterShape: 'poster',
      type: type === 'MOVIE' ? 'movie' : 'series',
    }

  }))).filter(item => item?.id);

}

module.exports = { fetchFreshCatalog };
