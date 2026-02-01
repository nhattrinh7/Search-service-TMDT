import { Module } from '@nestjs/common'
import { ElasticsearchModule } from '~/infrastructure/elasticsearch/elasticsearch.module'

@Module({
  imports: [ElasticsearchModule],
  providers: [],
  exports: [ElasticsearchModule],
})
export class InfrastructureModule {}
