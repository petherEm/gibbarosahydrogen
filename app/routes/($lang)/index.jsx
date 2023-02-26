import {defer} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {ProductSwimlane, FeaturedCollections, Hero} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {AnalyticsPageType} from '@shopify/hydrogen';

export async function loader({params, context}) {
  const {language, country} = context.storefront.i18n;

  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  return defer({
    shop,
    primaryHero: hero,
    // These different queries are separated to illustrate how 3rd party content
    // fetching can be optimized for both above and below the fold.
    featuredProducts: context.storefront.query(
      HOMEPAGE_FEATURED_PRODUCTS_QUERY,
      {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      },
    ),
    secondaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'torebki',
        country,
        language,
      },
    }),
    featuredCollections: context.storefront.query(FEATURED_COLLECTIONS_QUERY, {
      variables: {
        country,
        language,
      },
    }),
    tertiaryHero: context.storefront.query(COLLECTION_HERO_QUERY, {
      variables: {
        handle: 'torebki',
        country,
        language,
      },
    }),
    analytics: {
      pageType: AnalyticsPageType.home,
    },
  });
}

export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
  } = useLoaderData();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  // TODO: analytics
  // useServerAnalytics({
  //   shopify: {
  //     pageType: ShopifyAnalyticsConstants.pageType.home,
  //   },
  // });

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      <div>
        <img
          src="https://cdn.shopify.com/s/files/1/0669/2762/4456/files/DSCF0769.jpg?v=1676149504"
          alt=""
        />
      </div>

      {/* MID MENU */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex flex-col gap-4 xs:flex-row md:flex-row justify-around items-center">
          <div className="tracking-wider p-4 flex flex-col justify-between items-center bg-slate-400/20 h-[240px] w-[300px]">
            <h1 className="mt-4 text-center text-xl font-bold">
              Autentyczne produkty
            </h1>
            <p className="mt-4 text-center">
              Gibbarosa to wyjątkowa selekcja autentycznych produktów od
              luksusowych domów mody.
            </p>
            <div className="self-bottom  mt-4 font-semibold scale-110 transition-all duration-200 cursor-pointer">
              Dowiedz się więcej
            </div>
          </div>
          <div className="tracking-wider p-4 flex flex-col justify-between items-center bg-slate-400/20 h-[240px] w-[300px]">
            <h1 className="mt-4 text-center text-xl font-bold">
              14 dni na zwrot
            </h1>
            <p className="mt-4 text-center">
              Zakupione produkty mozna zwracać w ciągu 14 dni kalendarzowych od
              otrzymania przesyłki.
            </p>
            <div className="bottom-0 mt-4 font-semibold scale-110 transition-all duration-200 cursor-pointer">
              Dowiedz się więcej
            </div>
          </div>
          <div className="tracking-wider p-4 flex flex-col justify-between items-center bg-slate-400/20 h-[240px] w-[300px]">
            <h1 className="mt-4 text-center text-xl font-bold">
              Sprzedaj produkt
            </h1>
            <p className="mt-4 text-center">
              Odkupimy produkty, z którymi chcesz się pożegnać. Sprawdzamy
              autentyczność i stan przed zapłatą.
            </p>
            <div className="bottom-0 mt-4 font-semibold scale-110 transition-all ease-in-out duration-200 cursor-pointer">
              Dowiedz się więcej
            </div>
          </div>
        </div>
      </div>

      {/* MID BANNER - DARMOWA DOSTAWA */}
      <div className="uppercase text-[12px] h-10 md:h-16 md:text-lg tracking-wider flex justify-center items-center font-semibold text-slate-700 bg-[#f3a6f6]">
        <div>
          <h1>Darmowa dostawa dla wszystkich produktów</h1>
        </div>
      </div>

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane
                  products={products.nodes}
                  title="Nasze ulubione"
                  count={4}
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {/* {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )} */}

      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections?.nodes}
                  title="Nasze Kolekcje"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {/* {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )} */}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: PRICE, reverse: false) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/latest/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language)   {
    collections(
      first: 6,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
