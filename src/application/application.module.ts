import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { InfrastructureModule } from '~/infrastructure/infrastructure.module'
import { SearchProductsHandler } from '~/application/queries/search/search.handler'
import { TrackProductViewHandler } from '~/application/commands/track-product-view/track-product-view.command.handler'
import { GetTodayRecommendationsHandler } from '~/application/queries/get-today-recommendations/get-today-recommendations.handler'

const CommandHandlers = [
  TrackProductViewHandler,
]

const QueryHandlers = [
  SearchProductsHandler,
  GetTodayRecommendationsHandler,
]

const EventHandlers = [

]
 
@Module({
  imports: [
    CqrsModule,
    InfrastructureModule,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [],
})
export class ApplicationModule {}
