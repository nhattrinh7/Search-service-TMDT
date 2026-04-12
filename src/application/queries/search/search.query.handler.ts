import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { SearchProductsQuery } from '~/application/queries/search/search.query'
import {
  PRODUCTS_INDEX,
  SHOPS_INDEX,
  PRODUCT_SOURCE_FIELDS,
  SHOP_SOURCE_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  SHOP_SEARCH_FIELDS,
  ES_FUZZINESS,
} from '~/common/constants/index.constants'
import {
  SearchResponse,
  ProductSearchResult,
  ShopSearchResult,
} from '~/domain/interfaces/search.interface'

@QueryHandler(SearchProductsQuery)
export class SearchProductsHandler implements IQueryHandler<SearchProductsQuery> {
  constructor(private readonly esService: NestElasticsearchService) {}

  async execute(query: SearchProductsQuery): Promise<SearchResponse> {
    const {
      search,
      page,
      limit,
      rootCategory,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      sort,
      shopId,
    } = query
    const from = (page - 1) * limit

    // Build product query
    const productQuery = this.buildProductQuery(
      search,
      rootCategory,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      shopId,
    )

    // Nếu có shopId thì tìm shop đó theo ID
    // Nếu không có shopId thì tìm shops theo search term
    const shopQuery = shopId ? this.buildShopQueryByShopId(shopId) : this.buildShopQuery(search)

    // Build sort for products (only if sort is provided)
    const productSort = sort ? [{ 'price.min': { order: sort } }] : undefined

    // Use msearch to query both indices in one request
    const searches = [
      { index: PRODUCTS_INDEX },
      {
        query: productQuery,
        from,
        size: limit,
        _source: PRODUCT_SOURCE_FIELDS,
        ...(productSort && { sort: productSort }),
      },
      { index: SHOPS_INDEX },
      { query: shopQuery, from: 0, size: shopId ? 1 : limit, _source: SHOP_SOURCE_FIELDS },
    ]

    const response = await this.esService.msearch({ searches })

    const productResponse = response.responses[0]
    const shopResponse = response.responses[1]

    // Extract products
    const products: ProductSearchResult[] = []
    let totalProducts = 0
    if ('hits' in productResponse && productResponse.hits) {
      totalProducts =
        typeof productResponse.hits.total === 'number'
          ? productResponse.hits.total
          : (productResponse.hits.total?.value ?? 0)
      products.push(...productResponse.hits.hits.map(hit => hit._source as ProductSearchResult))
    }

    // Extract shops
    const shops: ShopSearchResult[] = []
    let totalShops = 0
    if (shopResponse && 'hits' in shopResponse && shopResponse.hits) {
      totalShops =
        typeof shopResponse.hits.total === 'number'
          ? shopResponse.hits.total
          : (shopResponse.hits.total?.value ?? 0)
      shops.push(...shopResponse.hits.hits.map(hit => hit._source as ShopSearchResult))
    }

    return {
      products: {
        items: products,
        meta: {
          page,
          limit,
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
        },
      },
      shops: {
        items: shops,
        meta: {
          page,
          limit,
          total: totalShops,
          totalPages: Math.ceil(totalShops / limit),
        },
      },
    }
  }

  private buildProductQuery(
    search?: string,
    rootCategory?: string,
    minPrice?: string,
    maxPrice?: string,
    minRating?: string,
    maxRating?: string,
    shopId?: string,
  ): Record<string, unknown> {
    const must: Record<string, unknown>[] = []
    const filter: Record<string, unknown>[] = [
      // Chỉ trả về sản phẩm còn hàng
      { term: { is_in_stock: true } },
    ]

    // Full-text search với fuzzy
    if (search) {
      must.push({
        multi_match: {
          query: search,
          fields: PRODUCT_SEARCH_FIELDS,
          fuzziness: ES_FUZZINESS,
        },
      })
    }

    // Filter by shopId (nếu có shopId thì chỉ tìm products của shop đó)
    if (shopId) {
      filter.push({
        term: { shopId: shopId },
      })
    }

    // Filter by root category
    if (rootCategory) {
      filter.push({
        term: { category_hierarchy: rootCategory },
      })
    }

    // Filter by price range
    // Logic: price.min <= umax AND price.max >= umin
    // Tức là khoảng giá của sản phẩm phải có giao với khoảng giá người dùng nhập
    if (minPrice || maxPrice) {
      const umin = minPrice ? parseInt(minPrice, 10) : undefined
      const umax = maxPrice ? parseInt(maxPrice, 10) : undefined

      // price.min <= umax (nếu có umax)
      if (umax !== undefined) {
        filter.push({
          range: { 'price.min': { lte: umax } },
        })
      }

      // price.max >= umin (nếu có umin)
      if (umin !== undefined) {
        filter.push({
          range: { 'price.max': { gte: umin } },
        })
      }
    }

    // Filter by rating range
    if (minRating || maxRating) {
      const ratingRange: Record<string, number> = {}
      if (minRating) ratingRange.gte = parseFloat(minRating)
      if (maxRating) ratingRange.lte = parseFloat(maxRating)

      filter.push({
        range: { ratingAvg: ratingRange },
      })
    }

    // If no search term, match all
    if (must.length === 0) {
      must.push({ match_all: {} })
    }

    return {
      bool: {
        must,
        filter,
      },
    }
  }

  private buildShopQuery(search?: string): Record<string, unknown> {
    if (search) {
      return {
        multi_match: {
          query: search,
          fields: SHOP_SEARCH_FIELDS,
          fuzziness: ES_FUZZINESS,
        },
      }
    }

    return { match_all: {} }
  }

  private buildShopQueryByShopId(shopId: string): Record<string, unknown> {
    return {
      term: { id: shopId },
    }
  }
}
