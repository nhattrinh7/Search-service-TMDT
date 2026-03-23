import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import type { estypes } from '@elastic/elasticsearch'
import { PRODUCTS_INDEX } from '~/common/constants/index.constants'
import { GetRootCategoryProductsQuery } from '~/application/queries/get-root-category-products/get-root-category-products.query'
import { PaginatedResult, ProductSearchResult } from '~/domain/types/search.types'

@QueryHandler(GetRootCategoryProductsQuery)
export class GetRootCategoryProductsHandler implements IQueryHandler<GetRootCategoryProductsQuery> {
  constructor(private readonly esService: NestElasticsearchService) {}

  async execute(query: GetRootCategoryProductsQuery): Promise<{ products: PaginatedResult<ProductSearchResult> }> {
    const { rootCategory, page, limit, minPrice, maxPrice, minRating, maxRating, sort } = query
    const from = (page - 1) * limit

    const productQuery = this.buildProductQuery(rootCategory, minPrice, maxPrice, minRating, maxRating)

    const productSort: estypes.Sort = sort
      ? [{ 'price.min': { order: sort } }]
      : [{ buy_count: { order: 'desc' as const } }]

    const response = await this.esService.search({
      index: PRODUCTS_INDEX,
      query: productQuery,
      from,
      size: limit,
      _source: ['id', 'name', 'main_image', 'price', 'ratingAvg', 'buy_count'],
      sort: productSort,
    })

    const products: ProductSearchResult[] = []
    let totalProducts = 0

    if ('hits' in response && response.hits) {
      totalProducts = typeof response.hits.total === 'number'
        ? response.hits.total
        : response.hits.total?.value ?? 0

      products.push(...response.hits.hits.map((hit) => hit._source as ProductSearchResult))
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
    }
  }

  private buildProductQuery(
    rootCategory: string,
    minPrice?: string,
    maxPrice?: string,
    minRating?: string,
    maxRating?: string,
  ): Record<string, unknown> {
    const filter: Record<string, unknown>[] = [
      { term: { is_in_stock: true } },
    ]

    const normalizedRoot = this.normalizeKeyword(rootCategory)
    filter.push({ term: { category_hierarchy: normalizedRoot } })

    if (minPrice || maxPrice) {
      const umin = minPrice ? parseInt(minPrice, 10) : undefined
      const umax = maxPrice ? parseInt(maxPrice, 10) : undefined

      if (umax !== undefined) {
        filter.push({
          range: { 'price.min': { lte: umax } },
        })
      }

      if (umin !== undefined) {
        filter.push({
          range: { 'price.max': { gte: umin } },
        })
      }
    }

    if (minRating || maxRating) {
      const ratingRange: Record<string, number> = {}
      if (minRating) ratingRange.gte = parseFloat(minRating)
      if (maxRating) ratingRange.lte = parseFloat(maxRating)

      filter.push({
        range: { ratingAvg: ratingRange },
      })
    }

    return {
      bool: {
        filter,
      },
    }
  }

  private normalizeKeyword(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }
}
