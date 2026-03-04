import { createZodDto } from 'nestjs-zod'
import z from 'zod'

export const SearchSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)) // chuyển kiểu dữ liệu sang int, nếu không có giá trị thì mặc định là 1
    .pipe(z.number().int().positive()), // xác thực lại sau khi chuyển kiểu dữ liệu
  
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().positive().max(50)),
  
  search: z
    .string()
    .optional()
    .transform((val) => val || undefined), // "laptop" → "laptop", "" → undefined, undefined → undefined
    // lí do mà "" → undefined là vì nếu ko muốn search thì đã ko cần truyền search vào url, đã search thì phải có giá trị
    // đằng này lại truyền search="" để làm quái gì, coi như ko truyền search vào cho rồi

  rootCategory: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  minPrice: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  sort: z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const normalized = val.toLowerCase();
    
    if (normalized !== 'asc' && normalized !== 'desc') 
      throw new Error('sort phải là "asc" hoặc "desc"')

    return normalized
  }),

  maxPrice: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  minRating: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  maxRating: z
    .string()
    .optional()
    .transform((val) => val || undefined),

  shopId: z
    .string()
    .optional()
    .transform((val) => val || undefined),
})
export class SearchDto extends createZodDto(SearchSchema) {}