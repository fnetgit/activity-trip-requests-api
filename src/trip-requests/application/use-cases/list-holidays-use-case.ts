import { DomainError } from '../../../shared/domain/errors/domain-error.js'
import type { HolidayOutput } from '../dtos/holiday-output.js'
import type { HolidaysGateway } from '../ports/holidays-gateway.js'

export class ListHolidaysUseCase {
  constructor(private readonly holidaysGateway: HolidaysGateway) {}

  async execute(year: number): Promise<HolidayOutput[]> {
    if (!Number.isInteger(year) || year <= 0) {
      throw new DomainError('VALIDATION_ERROR', 'Year must be a positive integer')
    }

    const holidays = await this.holidaysGateway.findByYear(year)

    return holidays.map((holiday) => ({
      date: holiday.date,
      name: holiday.name,
      type: holiday.type,
    }))
  }
}
