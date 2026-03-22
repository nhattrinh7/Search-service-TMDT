import { Module } from '@nestjs/common'
import { ElasticsearchModule } from '~/infrastructure/elasticsearch/elasticsearch.module'
import { CacheModule } from '~/infrastructure/cache/cache.module'

@Module({
  imports: [ElasticsearchModule, CacheModule],
  providers: [],
  exports: [ElasticsearchModule, CacheModule],
})
export class InfrastructureModule {}
