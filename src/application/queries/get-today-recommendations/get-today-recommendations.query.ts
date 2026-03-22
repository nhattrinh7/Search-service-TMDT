export class GetTodayRecommendationsQuery {
  constructor(
    public readonly userId: string | undefined,
    public readonly limit: number,
  ) {}
}
