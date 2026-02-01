import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { InfrastructureModule } from '~/infrastructure/infrastructure.module'
import { SearchProductsHandler } from '~/application/queries/search/search.handler'

const CommandHandlers = [

]

const QueryHandlers = [
  SearchProductsHandler,
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