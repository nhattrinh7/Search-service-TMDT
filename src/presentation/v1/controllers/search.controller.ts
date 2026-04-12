import { Controller, Get, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { SearchDto } from '~/presentation/dtos/search.dto'
import { SearchProductsQuery } from '~/application/queries/search/search.query'
import { RootCategoryProductsDto } from '~/presentation/dtos/root-category-products.dto'
import { GetRootCategoryProductsQuery } from '~/application/queries/get-root-category-products/get-root-category-products.query'

@Controller('v1/searchs')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/')
  async search(@Query() query: SearchDto) {
    const result = await this.queryBus.execute(
      new SearchProductsQuery(
        query.search,
        query.page,
        query.limit,
        query.rootCategory,
        query.minPrice,
        query.maxPrice,
        query.minRating,
        query.maxRating,
        query.sort,
        query.shopId,
      ),
    )

    return { message: 'Search successful', data: result }
  }

  @Get('/root-category-products')
  async getRootCategoryProducts(@Query() query: RootCategoryProductsDto) {
    const result = await this.queryBus.execute(
      new GetRootCategoryProductsQuery(
        query.rootCategory,
        query.page,
        query.limit,
        query.minPrice,
        query.maxPrice,
        query.minRating,
        query.maxRating,
        query.sort,
      ),
    )

    return { message: 'Get root category products successful', data: result }
  }
}
