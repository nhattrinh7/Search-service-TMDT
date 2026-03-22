import { ProductSearchDocument } from '~/domain/types/product-search.types'

export interface IProductSearchRepository {
  getProductsByIds(ids: string[]): Promise<ProductSearchDocument[]>
  getTopProductsByBuyCount(limit: number): Promise<ProductSearchDocument[]>
}

export const PRODUCT_SEARCH_REPOSITORY = Symbol('IProductSearchRepository')
