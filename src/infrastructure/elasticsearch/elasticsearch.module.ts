import { Module } from '@nestjs/common'
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ElasticsearchService } from '~/infrastructure/elasticsearch/elasticsearch.service'

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      }),
    }),
  ],
  providers: [ElasticsearchService],
  exports: [NestElasticsearchModule],
})
export class ElasticsearchModule {}
