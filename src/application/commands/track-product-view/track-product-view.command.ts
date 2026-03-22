export class TrackProductViewCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
  ) {}
}
