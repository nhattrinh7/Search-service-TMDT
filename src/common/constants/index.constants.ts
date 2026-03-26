export const PRODUCTS_INDEX = 'products'
export const SHOPS_INDEX = 'shops'
export const RECENT_RATIO = 0.3
export const RECENTLY_VIEWED_PREFIX = 'recently_viewed'
export const RECENTLY_VIEWED_LIMIT = 10
export const RECENTLY_VIEWED_TTL_SECONDS = 60 * 60 * 24 * 3

// Elasticsearch _source field selections
export const PRODUCT_SOURCE_FIELDS = ['id', 'name', 'main_image', 'price', 'ratingAvg', 'buy_count']
export const SHOP_SOURCE_FIELDS = ['id', 'name', 'description', 'logo']

// Elasticsearch search fields với boost weights
export const PRODUCT_SEARCH_FIELDS = ['name^3', 'description', 'sku', 'attributes.*']
export const SHOP_SEARCH_FIELDS = ['name^2', 'description']

// Elasticsearch fuzziness
export const ES_FUZZINESS = 'AUTO' as const
