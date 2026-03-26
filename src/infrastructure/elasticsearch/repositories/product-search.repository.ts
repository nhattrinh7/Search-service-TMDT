import { Injectable } from '@nestjs/common'
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch'
import { PRODUCTS_INDEX } from '~/common/constants/index.constants'
import { IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { ProductSearchDocument } from '~/domain/interfaces/search.interface'

@Injectable()
export class ProductSearchRepository implements IProductSearchRepository {
  constructor(private readonly esService: NestElasticsearchService) {}

  async getProductsByIds(ids: string[]): Promise<ProductSearchDocument[]> {
    if (ids.length === 0) return []

    const response = await this.esService.mget({
      index: PRODUCTS_INDEX,
      ids,
    })

    return response.docs
      .filter((doc) => this.hasSource(doc))
      .map((doc) => (doc as { _source: ProductSearchDocument })._source)
  }

  async getTopProductsByBuyCount(limit: number): Promise<ProductSearchDocument[]> {
    if (limit <= 0) return []

    const response = await this.esService.search<ProductSearchDocument>({
      index: PRODUCTS_INDEX,
      size: limit,
      query: {
        bool: {
          filter: [
            { term: { is_in_stock: true } },
          ],
        },
      },
      sort: [
        { buy_count: { order: 'desc' } },
        { ratingAvg: { order: 'desc' } },
      ],
    })

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((item): item is ProductSearchDocument => Boolean(item))
  }

  private hasSource(
    doc: unknown,
  ): doc is { _source: ProductSearchDocument, found?: boolean } {
    if (!doc || typeof doc !== 'object') return false
    if (!('_source' in doc)) return false
    if ('found' in doc && (doc as { found?: boolean }).found === false) return false
    return true
  }
}
