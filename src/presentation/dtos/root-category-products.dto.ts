import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const RootCategoryProductsSchema = z.object({
  rootCategory: z.string().min(1, 'rootCategory là bắt buộc'),

  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().positive().max(50)),

  minPrice: z
    .string()
    .optional()
    .transform(val => val || undefined),

  maxPrice: z
    .string()
    .optional()
    .transform(val => val || undefined),

  minRating: z
    .string()
    .optional()
    .transform(val => val || undefined),

  maxRating: z
    .string()
    .optional()
    .transform(val => val || undefined),

  sort: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined
      const normalized = val.toLowerCase()

      if (normalized !== 'asc' && normalized !== 'desc')
        throw new Error("sort phải là 'asc' hoặc 'desc'")

      return normalized
    }),
})

export class RootCategoryProductsDto extends createZodDto(RootCategoryProductsSchema) {}
