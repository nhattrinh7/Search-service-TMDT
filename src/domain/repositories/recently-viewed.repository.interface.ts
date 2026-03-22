export interface IRecentlyViewedRepository {
  addViewedProduct(userId: string, productId: string): Promise<void>
  getRecentProductIds(userId: string, limit: number): Promise<string[]>
}

export const RECENTLY_VIEWED_REPOSITORY = Symbol('IRecentlyViewedRepository')
