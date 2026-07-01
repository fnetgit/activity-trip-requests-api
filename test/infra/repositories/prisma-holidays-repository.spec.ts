import type { PrismaClient } from '@prisma/client'
import { mockDeep } from 'vitest-mock-extended'
import type { DeepMockProxy } from 'vitest-mock-extended'

import { PrismaHolidaysRepository } from '#src/trip-requests/infra/repositories/prisma-holidays-repository'

describe('PrismaHolidaysRepository', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let repository: PrismaHolidaysRepository

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>()
    repository = new PrismaHolidaysRepository(prisma)
  })

  it('lists holidays from a year ordered by date', async () => {
    prisma.holiday.findMany.mockResolvedValue([
      {
        date: '2026-01-01',
        name: 'Confraternizacao Universal',
        type: 'national',
        year: 2026,
      },
    ])

    await expect(repository.findByYear(2026)).resolves.toStrictEqual([
      {
        date: '2026-01-01',
        name: 'Confraternizacao Universal',
        type: 'national',
      },
    ])
    expect(prisma.holiday.findMany.mock.calls).toStrictEqual([
      [
        {
          where: {
            year: 2026,
          },
          orderBy: {
            date: 'asc',
          },
        },
      ],
    ])
  })

  it('stores holidays using the received year', async () => {
    await repository.saveMany(2026, [
      {
        date: '2026-04-21',
        name: 'Tiradentes',
        type: 'national',
      },
    ])

    expect(prisma.holiday.createMany.mock.calls).toStrictEqual([
      [
        {
          data: [
            {
              date: '2026-04-21',
              name: 'Tiradentes',
              type: 'national',
              year: 2026,
            },
          ],
          skipDuplicates: true,
        },
      ],
    ])
  })
})
