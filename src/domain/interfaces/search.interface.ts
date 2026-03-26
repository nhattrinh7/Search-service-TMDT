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

export interface ProductSearchDocument {
  id: string
  shopId: string
  sku: string
  name: string
  main_image: string
  description: string
  category: string
  category_hierarchy: string[]
  price: {
    min: number
    max: number
  }
  ratingAvg: number
  buy_count: number
  is_in_stock: boolean
  attributes: Record<string, unknown>
}
