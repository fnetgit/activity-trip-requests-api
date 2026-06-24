import { DomainError } from '#src/shared/domain/errors/domain-error'
import type { Holiday, HolidaysGateway } from '#src/trip-requests/application/ports/holidays-gateway'
import { ListHolidaysUseCase } from '#src/trip-requests/application/use-cases/list-holidays-use-case'

class FakeHolidaysGateway implements HolidaysGateway {
  constructor(private readonly holidays: Holiday[] = []) {}

  async findByYear(): Promise<Holiday[]> {
    return this.holidays
  }
}

describe('ListHolidaysUseCase', () => {
  it('returns holidays from the gateway', async () => {
    const useCase = new ListHolidaysUseCase(
      new FakeHolidaysGateway([
        {
          date: '2026-01-01',
          name: 'Confraternizacao Universal',
          type: 'national',
        },
      ]),
    )

    await expect(useCase.execute(2026)).resolves.toStrictEqual([
      {
        date: '2026-01-01',
        name: 'Confraternizacao Universal',
        type: 'national',
      },
    ])
  })

  it.each([0, -1, 2026.5])('rejects invalid year: %s', async (year) => {
    const useCase = new ListHolidaysUseCase(new FakeHolidaysGateway())

    await expect(useCase.execute(year)).rejects.toThrow(
      new DomainError('VALIDATION_ERROR', 'Year must be a positive integer'),
    )
  })
})
