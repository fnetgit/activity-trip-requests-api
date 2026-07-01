import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { Holiday, HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import type { HolidaysRepository } from '#src/trip-requests/application/ports/holidays-repository'
import { MirroringHolidaysGateway } from '#src/trip-requests/infra/gateways/mirroring-holidays-gateway'

class FakeHolidaysRepository implements HolidaysRepository {
  readonly savedHolidays: Array<{ year: number; holidays: Holiday[] }> = []

  constructor(private readonly storedHolidays: Holiday[] = []) {}

  async findByYear(): Promise<Holiday[]> {
    return this.storedHolidays
  }

  async saveMany(year: number, holidays: Holiday[]): Promise<void> {
    this.savedHolidays.push({ year, holidays })
  }
}

class FakeSourceHolidaysGateway implements HolidaysGateway {
  readonly requestedYears: number[] = []

  constructor(private readonly holidays: Holiday[] = []) {}

  async findByYear(year: number): Promise<Holiday[]> {
    this.requestedYears.push(year)

    return this.holidays
  }
}

class FailingSourceHolidaysGateway implements HolidaysGateway {
  async findByYear(): Promise<Holiday[]> {
    throw new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable')
  }
}

describe('MirroringHolidaysGateway', () => {
  it('returns stored holidays without calling the source gateway', async () => {
    const storedHolidays = [
      {
        date: '2026-01-01',
        name: 'Confraternizacao Universal',
        type: 'national',
      },
    ]
    const repository = new FakeHolidaysRepository(storedHolidays)
    const sourceGateway = new FakeSourceHolidaysGateway()
    const gateway = new MirroringHolidaysGateway(repository, sourceGateway)

    await expect(gateway.findByYear(2026)).resolves.toStrictEqual(storedHolidays)
    expect(sourceGateway.requestedYears).toStrictEqual([])
    expect(repository.savedHolidays).toStrictEqual([])
  })

  it('fetches and stores source holidays when the year is not mirrored yet', async () => {
    const sourceHolidays = [
      {
        date: '2026-04-21',
        name: 'Tiradentes',
        type: 'national',
      },
    ]
    const repository = new FakeHolidaysRepository()
    const sourceGateway = new FakeSourceHolidaysGateway(sourceHolidays)
    const gateway = new MirroringHolidaysGateway(repository, sourceGateway)

    await expect(gateway.findByYear(2026)).resolves.toStrictEqual(sourceHolidays)
    expect(sourceGateway.requestedYears).toStrictEqual([2026])
    expect(repository.savedHolidays).toStrictEqual([
      {
        year: 2026,
        holidays: sourceHolidays,
      },
    ])
  })

  it('does not store holidays when the source gateway fails', async () => {
    const repository = new FakeHolidaysRepository()
    const gateway = new MirroringHolidaysGateway(repository, new FailingSourceHolidaysGateway())

    await expect(gateway.findByYear(2026)).rejects.toThrow(
      new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable'),
    )
    expect(repository.savedHolidays).toStrictEqual([])
  })
})
