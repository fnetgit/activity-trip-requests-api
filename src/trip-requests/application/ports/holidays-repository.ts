import type { Holiday } from './holidays-gateway.js'

export interface HolidaysRepository {
  findByYear(year: number): Promise<Holiday[]>
  saveMany(year: number, holidays: Holiday[]): Promise<void>
}
