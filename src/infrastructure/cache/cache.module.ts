import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '~/infrastructure/cache/redis.constants'
import { RecentlyViewedRepository } from '~/infrastructure/cache/recently-viewed.repository'
import { RECENTLY_VIEWED_REPOSITORY } from '~/domain/repositories/recently-viewed.repository.interface'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost')
        const port = configService.get<number>('REDIS_PORT', 6379)
        const password = configService.get<string>('REDIS_PASSWORD')

        return new Redis({
          host,
          port,
          password, // nếu password là undefined thì ioredis sẽ tự động bỏ qua trường này, nên ko cần check riêng
          maxRetriesPerRequest: 3,
        })
      },
      inject: [ConfigService],
    },
    {
      provide: RECENTLY_VIEWED_REPOSITORY,
      useClass: RecentlyViewedRepository,
    },
  ],
  exports: [RECENTLY_VIEWED_REPOSITORY, REDIS_CLIENT],
})
export class CacheModule {}
