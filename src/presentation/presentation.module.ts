import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { SearchController } from '~/presentation/v1/controllers/search.controller'
import { ApplicationModule } from '~/application/application.module'

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [SearchController],
  exports: [],
})
export class PresentationModule {}
