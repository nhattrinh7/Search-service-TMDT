import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const TrackProductViewBodySchema = z.object({
  productId: z.uuid(),
})
export class TrackProductViewBodyDto extends createZodDto(TrackProductViewBodySchema) {}

export const GetTodayRecommendationsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 25))
    .pipe(z.number().int().positive().max(50)),
})
export class GetTodayRecommendationsQueryDto extends createZodDto(GetTodayRecommendationsQuerySchema) {}
