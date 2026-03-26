import { ProductSearchDocument } from '~/domain/interfaces/search.interface'

export interface IProductSearchRepository {
  getProductsByIds(ids: string[]): Promise<ProductSearchDocument[]>
  getTopProductsByBuyCount(limit: number): Promise<ProductSearchDocument[]>
}

export const PRODUCT_SEARCH_REPOSITORY = Symbol('IProductSearchRepository')
