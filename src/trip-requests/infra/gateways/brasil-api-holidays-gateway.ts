import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { Holiday, HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'

export class BrasilApiHolidaysGateway implements HolidaysGateway {
  constructor(private readonly baseUrl: string) {}

  async findByYear(year: number): Promise<Holiday[]> {
    const response = await this.fetchHolidays(year)
    const body = await this.parseResponse(response)

    if (!Array.isArray(body)) {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }

    return body.map((holiday: unknown) => this.parseHoliday(holiday))
  }

  private async fetchHolidays(year: number): Promise<Response> {
    try {
      const url = new URL(`/api/feriados/v1/${String(year)}`, this.baseUrl)

      return await fetch(url)
    } catch {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }
  }

  private async parseResponse(response: Response): Promise<unknown> {
    if (!response.ok) {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }

    try {
      return await response.json()
    } catch {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }
  }

  private parseHoliday(holiday: unknown): Holiday {
    if (typeof holiday !== 'object' || holiday === null) {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }

    const holidayRecord = holiday as Record<string, unknown>

    if (
      typeof holidayRecord['date'] !== 'string' ||
      typeof holidayRecord['name'] !== 'string' ||
      typeof holidayRecord['type'] !== 'string'
    ) {
      throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
    }

    return {
      date: holidayRecord['date'],
      name: holidayRecord['name'],
      type: holidayRecord['type'],
    }
  }
}
