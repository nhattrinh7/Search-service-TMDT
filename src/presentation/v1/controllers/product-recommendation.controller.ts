import { BadRequestException, Body, Controller, Get, Headers, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import {
  TrackProductViewBodyDto,
  GetTodayRecommendationsQueryDto,
} from '~/presentation/dtos/recommendation.dto'
import { TrackProductViewCommand } from '~/application/commands/track-product-view/track-product-view.command'
import { GetTodayRecommendationsQuery } from '~/application/queries/get-today-recommendations/get-today-recommendations.query'
import { ProductSearchResult } from '~/domain/interfaces/search.interface'

@Controller('v1/recommendations')
export class ProductRecommendationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/views')
  async trackProductView(
    @Headers('x-user-id') userId: string,
    @Body() body: TrackProductViewBodyDto,
  ): Promise<{ message: string; data: null }> {
    if (!userId) {
      throw new BadRequestException('Missing x-user-id')
    }

    await this.commandBus.execute(new TrackProductViewCommand(userId, body.productId))
    return { message: 'Track product view successful', data: null }
  }

  @Get('/')
  async getTodayRecommendations(
    @Headers('x-user-id') userId: string | undefined,
    @Query() query: GetTodayRecommendationsQueryDto,
  ): Promise<{
    message: string
    data: { items: ProductSearchResult[] }
  }> {
    const result = await this.queryBus.execute(
      new GetTodayRecommendationsQuery(userId, query.limit),
    )

    return { message: 'Get today recommendations successful', data: result }
  }
}
