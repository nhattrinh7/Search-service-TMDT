export interface ProductSearchResult {
  id: string
  name: string
  main_image: string
  price: {
    min: number
    max: number
  }
  ratingAvg: number
  buy_count: number
}

export interface ShopSearchResult {
  id: string
  name: string
  description: string
  logo: string
}

export interface PaginatedMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginatedMeta
}

export interface SearchResponse {
  products: PaginatedResult<ProductSearchResult>
  shops: PaginatedResult<ShopSearchResult>
}

