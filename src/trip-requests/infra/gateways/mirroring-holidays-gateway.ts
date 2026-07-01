import type { HolidaysGateway, Holiday } from '../../application/ports/holidays-gateway.js'
import type { HolidaysRepository } from '../../application/ports/holidays-repository.js'

export class MirroringHolidaysGateway implements HolidaysGateway {
  constructor(
    private readonly holidaysRepository: HolidaysRepository,
    private readonly sourceHolidaysGateway: HolidaysGateway,
  ) {}

  async findByYear(year: number): Promise<Holiday[]> {
    const storedHolidays = await this.holidaysRepository.findByYear(year)

    if (storedHolidays.length > 0) {
      return storedHolidays
    }

    const sourceHolidays = await this.sourceHolidaysGateway.findByYear(year)
    await this.holidaysRepository.saveMany(year, sourceHolidays)

    return sourceHolidays
  }
}
