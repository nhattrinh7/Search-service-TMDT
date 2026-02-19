import {
  Controller,
  Get,
  Query,
} from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { SearchDto } from '~/presentation/v1/dtos/search.dto'
import { SearchProductsQuery } from '~/application/queries/search/search.query'

@Controller('v1/search')
export class SearchController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/')
  async search(
    @Query() query: SearchDto,
  ) {
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
      )
    )
    
    return { message: 'Search successful', data: result }
  }

}
