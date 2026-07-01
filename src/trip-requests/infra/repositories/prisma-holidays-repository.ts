import type { PrismaClient } from '@prisma/client'

import type { Holiday } from '#src/trip-requests/application/ports/holidays-gateway'
import type { HolidaysRepository } from '#src/trip-requests/application/ports/holidays-repository'

export class PrismaHolidaysRepository implements HolidaysRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByYear(year: number): Promise<Holiday[]> {
    const holidays = await this.prisma.holiday.findMany({
      where: {
        year,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return holidays.map((holiday) => ({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
    }))
  }

  async saveMany(year: number, holidays: Holiday[]): Promise<void> {
    await this.prisma.holiday.createMany({
      data: holidays.map((holiday) => ({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        year,
      })),
      skipDuplicates: true,
    })
  }
}
