const axios = require('axios');

const PAGE_SIZE = 20;

async function fetchFreshCatalog(type, providerId, offset = 0) {
  const country = 'BR';
  const language = 'pt';
  const providers = [providerId];

  try {
    const res = await axios.post('https://apis.justwatch.com/graphql', {
      operationName: 'GetPopularTitles',
      variables: {
        popularTitlesSortBy: 'TRENDING',
        first: PAGE_SIZE,
        platform: 'WEB',
        sortRandomSeed: 0,
        popularAfterCursor: '',
        offset,
        popularTitlesFilter: {
          ageCertifications: [],
          excludeGenres: [],
          excludeProductionCountries: [],
          genres: [],
          objectTypes: [type], // 'MOVIE' ou 'SHOW'
          productionCountries: [],
          packages: providers,
          excludeIrrelevantTitles: false,
          presentationTypes: [],
          monetizationTypes: [] // sem filtro; ajuste se quiser limitar
        },
        language,
        country
      },
      query: `
        query GetPopularTitles(
          $country: Country!
          $popularTitlesFilter: TitleFilter
          $popularAfterCursor: String
          $popularTitlesSortBy: PopularTitlesSorting! = POPULAR
          $first: Int!
          $language: Language!
          $offset: Int = 0
          $sortRandomSeed: Int! = 0
          $profile: PosterProfile
          $backdropProfile: BackdropProfile
          $format: ImageFormat
        ) {
          popularTitles(
            country: $country
            filter: $popularTitlesFilter
            offset: $offset
            after: $popularAfterCursor
            sortBy: $popularTitlesSortBy
            first: $first
            sortRandomSeed: $sortRandomSeed
          ) {
            totalCount
            pageInfo {
              startCursor
              endCursor
              hasPreviousPage
              hasNextPage
              __typename
            }
            edges {
              cursor
              node {
                id
                objectId
                objectType
                content(country: $country, language: $language) {
                  externalIds {
                    imdbId
                  }
                  title
                  fullPath
                  scoring {
                    imdbScore
                    __typename
                  }
                  posterUrl(profile: $profile, format: $format)
                  ... on ShowContent {
                    backdrops(profile: $backdropProfile, format: $format) {
                      backdropUrl
                      __typename
                    }
                    __typename
                  }
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
        }
      `
    });

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
