import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetTodayRecommendationsQuery } from '~/application/queries/get-today-recommendations/get-today-recommendations.query'
import { PRODUCT_SEARCH_REPOSITORY, type IProductSearchRepository } from '~/domain/repositories/product-search.repository.interface'
import { RECENTLY_VIEWED_REPOSITORY, type IRecentlyViewedRepository } from '~/domain/repositories/recently-viewed.repository.interface'
import { ProductSearchResult, type ProductSearchDocument } from '~/domain/interfaces/search.interface'
import { RECENT_RATIO } from '~/common/constants/index.constants'

@QueryHandler(GetTodayRecommendationsQuery)
export class GetTodayRecommendationsHandler implements IQueryHandler<GetTodayRecommendationsQuery> {
  constructor(
    @Inject(RECENTLY_VIEWED_REPOSITORY)
    private readonly recentlyViewedRepository: IRecentlyViewedRepository,
    @Inject(PRODUCT_SEARCH_REPOSITORY)
    private readonly productSearchRepository: IProductSearchRepository,
  ) {}

  async execute(query: GetTodayRecommendationsQuery): Promise<{ items: ProductSearchResult[] }> {
    const totalLimit = Math.max(query.limit, 0)
    if (totalLimit === 0) return { items: [] }

    // Số lượng sản phẩm người dùng xem gần đây chỉ chiến 30% tổng số sản phẩm trả về
    const recentTarget = Math.ceil(totalLimit * RECENT_RATIO)

    // Lấy danh sách ID sản phẩm người dùng đã xem gần đây trong Redis
    const recentIds = query.userId
      ? await this.recentlyViewedRepository.getRecentProductIds(query.userId, recentTarget)
      : []

    // từ IDs lấy ra các sản phẩm tương ứng trong Elasticsearch
    const recentProducts = recentIds.length > 0
      ? await this.productSearchRepository.getProductsByIds(recentIds)
      : []

    // Lọc bỏ các sản phẩm hết hàng
    const filteredRecent = recentProducts.filter((product) => product.is_in_stock)

    // lọc trùng, còn dùng ở phía dưới để đảm bảo ko trùng giữa recent và top buy_count
    const recentIdSet = new Set(filteredRecent.map((item) => item.id))

    const needTop = totalLimit - filteredRecent.length
    const topProducts = needTop > 0
      // đáng lẽ chỉ cần truyền needTop nhưng để phòng trường hợp có nhiều sản phẩm trong top buy_count bị hết hàng hoặc 
      // trùng với recent thì lấy dư ra, nên truyền thêm 1 lượng recentIdSet.size, nếu tất cả sản phẩm trong recent đều
      // trùng đi chăng nữa thì tí nữa lọc trùng cũng vẫn sẽ đủ số lượng cần thiết trả về
      ? await this.productSearchRepository.getTopProductsByBuyCount(needTop + recentIdSet.size)
      : []

    const topFiltered = topProducts.filter((product) => !recentIdSet.has(product.id))
    const merged = [
      ...filteredRecent,
      ...topFiltered.slice(0, needTop), // dùng slice để đảm bảo ko trả về quá số lượng cần thiết
    ]

    return { items: merged.map((product) => this.toSearchResult(product)) }
  }

  private toSearchResult(product: ProductSearchDocument): ProductSearchResult {
    return {
      id: product.id,
      name: product.name,
      main_image: product.main_image,
      price: product.price,
      ratingAvg: product.ratingAvg,
      buy_count: product.buy_count,
    }
  }
}
