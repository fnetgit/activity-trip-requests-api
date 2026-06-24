import { DomainError } from '#src/shared/domain/errors/domain-error'
import { BrasilApiHolidaysGateway } from '#src/trip-requests/infra/gateways/brasil-api-holidays-gateway'

describe('BrasilApiHolidaysGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches national holidays from BrasilAPI', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json([
        {
          date: '2026-01-01',
          name: 'Confraternizacao Universal',
          type: 'national',
        },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    const gateway = new BrasilApiHolidaysGateway('https://brasilapi.com.br')

    await expect(gateway.findByYear(2026)).resolves.toStrictEqual([
      {
        date: '2026-01-01',
        name: 'Confraternizacao Universal',
        type: 'national',
      },
    ])
    expect(fetchMock).toHaveBeenCalledWith(new URL('https://brasilapi.com.br/api/feriados/v1/2026'))
  })

  it('maps unavailable responses to a domain error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 502 })),
    )
    const gateway = new BrasilApiHolidaysGateway('https://brasilapi.com.br')

    await expect(gateway.findByYear(2026)).rejects.toThrow(
      new DomainError('HOLIDAYS_API_UNAVAILABLE', 'Holidays API is unavailable'),
    )
  })
})
