import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { SearchController } from '~/presentation/v1/controllers/search.controller'
import { ProductRecommendationController } from '~/presentation/v1/controllers/product-recommendation.controller'
import { ApplicationModule } from '~/application/application.module'

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [SearchController, ProductRecommendationController],
  exports: [],
})
export class PresentationModule {}
