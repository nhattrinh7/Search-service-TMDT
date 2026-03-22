import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { TrackProductViewCommand } from '~/application/commands/track-product-view/track-product-view.command'
import { RECENTLY_VIEWED_REPOSITORY, type IRecentlyViewedRepository } from '~/domain/repositories/recently-viewed.repository.interface'

@CommandHandler(TrackProductViewCommand)
export class TrackProductViewHandler implements ICommandHandler<TrackProductViewCommand, void> {
  constructor(
    @Inject(RECENTLY_VIEWED_REPOSITORY)
    private readonly recentlyViewedRepository: IRecentlyViewedRepository,
  ) {}

  async execute(command: TrackProductViewCommand): Promise<void> {
    const { userId, productId } = command
    await this.recentlyViewedRepository.addViewedProduct(userId, productId)
  }
}
