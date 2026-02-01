export class SearchProductsQuery {
  constructor(
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly rootCategory?: string,
    public readonly minPrice?: string,
    public readonly maxPrice?: string,
    public readonly minRating?: string,
    public readonly maxRating?: string,
    public readonly sort?: 'asc' | 'desc',
  ) {}
}
