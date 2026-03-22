import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from '~/infrastructure/cache/redis.constants'
import { IRecentlyViewedRepository } from '~/domain/repositories/recently-viewed.repository.interface'
import { RECENTLY_VIEWED_PREFIX, RECENTLY_VIEWED_LIMIT, RECENTLY_VIEWED_TTL_SECONDS } from '~/common/constants/index.constants'

@Injectable()
export class RecentlyViewedRepository implements IRecentlyViewedRepository {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async addViewedProduct(userId: string, productId: string): Promise<void> {
    const key = `${RECENTLY_VIEWED_PREFIX}:${userId}`

    const pipeline = this.redis.pipeline()
    pipeline.lrem(key, 0, productId)
    pipeline.lpush(key, productId)
    pipeline.ltrim(key, 0, RECENTLY_VIEWED_LIMIT - 1)
    pipeline.expire(key, RECENTLY_VIEWED_TTL_SECONDS)
    await pipeline.exec()
  }

  getRecentProductIds(userId: string, limit: number): Promise<string[]> {
    const key = `${RECENTLY_VIEWED_PREFIX}:${userId}`
    const safeLimit = Math.min(Math.max(limit, 0), RECENTLY_VIEWED_LIMIT)
    if (safeLimit === 0) return Promise.resolve([])

    // ko cần await ở đây vì đã có await ở tầng trên
    // LRANGE key start stop : lấy ra list từ start đến stop (bao gồm cả phần tử start và stop)
    // lấy từ 0 nên trừ đi 1
    return this.redis.lrange(key, 0, safeLimit - 1)
  }
}
