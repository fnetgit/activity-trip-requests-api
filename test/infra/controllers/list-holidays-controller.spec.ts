import type { HolidayOutput } from '#src/trip-requests/application/dtos/holiday-output'
import { ListHolidaysController } from '#src/trip-requests/infra/controllers/list-holidays-controller'

import { FailingValidator, makeHolidayOutput, StaticValidator } from './controller-test-helpers.js'

class FakeListHolidaysUseCase {
  readonly receivedYears: number[] = []

  constructor(
    private readonly result: HolidayOutput[] = [makeHolidayOutput()],
    private readonly error?: Error,
  ) {}

  async execute(year: number): Promise<HolidayOutput[]> {
    this.receivedYears.push(year)

    if (this.error !== undefined) {
      throw this.error
    }

    return this.result
  }
}

describe('ListHolidaysController', () => {
  it('converts params year to number and returns 200', async () => {
    const output = [makeHolidayOutput()]
    const useCase = new FakeListHolidaysUseCase(output)
    const controller = new ListHolidaysController(useCase, new StaticValidator({ year: 2026 }))

    await expect(controller.handle({ body: undefined, params: { year: '2026' } })).resolves.toStrictEqual({
      statusCode: 200,
      body: {
        success: true,
        data: output,
      },
    })
    expect(useCase.receivedYears).toStrictEqual([2026])
  })

  it('maps invalid year validation errors to 400', async () => {
    const useCase = new FakeListHolidaysUseCase()
    const controller = new ListHolidaysController(useCase, new FailingValidator('Year must be a positive integer'))

    await expect(controller.handle({ body: undefined, params: { year: 'invalid' } })).resolves.toStrictEqual({
      statusCode: 400,
      body: {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Year must be a positive integer',
        },
      },
    })
    expect(useCase.receivedYears).toStrictEqual([])
  })
})
