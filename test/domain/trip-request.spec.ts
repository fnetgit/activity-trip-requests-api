import { DomainError } from '#src/shared/domain/errors/domain-error'
import { UniqueEntityId } from '#src/shared/domain/value-objects/unique-entity-id'
import { TripRequest } from '#src/trip-requests/domain/entities/trip-request'

const makeTripRequestInput = () => ({
  requesterName: 'Maria Silva',
  origin: 'Parnaiba',
  destination: 'Teresina',
  departureAt: '2026-06-24T07:00:00-03:00',
  returnAt: '2026-06-24T18:00:00.000Z',
  purpose: 'Participation in an institutional meeting',
  passengerCount: 3,
  createdAt: '2026-06-20T14:30:00.000Z',
})

describe('TripRequest', () => {
  it('creates a pending trip request', () => {
    const tripRequest = TripRequest.create(makeTripRequestInput(), new UniqueEntityId('1'))

    expect(tripRequest.status).toBe('pending')
    expect(tripRequest.toJSON()).toStrictEqual({
      id: '1',
      requesterName: 'Maria Silva',
      origin: 'Parnaiba',
      destination: 'Teresina',
      departureAt: '2026-06-24T10:00:00.000Z',
      returnAt: '2026-06-24T18:00:00.000Z',
      purpose: 'Participation in an institutional meeting',
      passengerCount: 3,
      status: 'pending',
      createdAt: '2026-06-20T14:30:00.000Z',
    })
  })

  it('uses the departure UTC civil date', () => {
    const tripRequest = TripRequest.create({
      ...makeTripRequestInput(),
      departureAt: '2026-06-24T23:30:00-03:00',
      returnAt: '2026-06-25T03:00:00.000Z',
    })

    expect(tripRequest.departureCivilDate).toBe('2026-06-25')
  })

  it('rejects return date before departure date', () => {
    expect(() =>
      TripRequest.create({
        ...makeTripRequestInput(),
        departureAt: '2026-06-24T10:00:00.000Z',
        returnAt: '2026-06-24T09:59:59.999Z',
      }),
    ).toThrow(new DomainError('VALIDATION_ERROR', 'Return date must be equal to or after departure date'))
  })

  it.each([0, -1, 1.5])('rejects invalid passenger count: %s', (passengerCount) => {
    expect(() =>
      TripRequest.create({
        ...makeTripRequestInput(),
        passengerCount,
      }),
    ).toThrow(new DomainError('VALIDATION_ERROR', 'Passenger count must be greater than zero'))
  })

  it.each([
    ['requesterName', 'requesterName is required'],
    ['origin', 'origin is required'],
    ['destination', 'destination is required'],
    ['purpose', 'purpose is required'],
  ] as const)('rejects empty text field: %s', (field, message) => {
    expect(() =>
      TripRequest.create({
        ...makeTripRequestInput(),
        [field]: '   ',
      }),
    ).toThrow(new DomainError('VALIDATION_ERROR', message))
  })

  it.each([
    ['requesterName', undefined, 'requesterName is required'],
    ['origin', 123, 'origin is required'],
    ['departureAt', null, 'departureAt must be a valid ISO 8601 value'],
  ] as const)('rejects invalid field value: %s', (field, value, message) => {
    expect(() =>
      TripRequest.create({
        ...makeTripRequestInput(),
        [field]: value,
      }),
    ).toThrow(new DomainError('VALIDATION_ERROR', message))
  })

  it('cancels a pending trip request', () => {
    const tripRequest = TripRequest.create(makeTripRequestInput())

    tripRequest.cancel()

    expect(tripRequest.status).toBe('canceled')
    expect(tripRequest.toJSON().status).toBe('canceled')
  })

  it('rejects canceling an already canceled trip request', () => {
    const tripRequest = TripRequest.create(makeTripRequestInput())
    tripRequest.cancel()

    expect(() => {
      tripRequest.cancel()
    }).toThrow(new DomainError('TRIP_REQUEST_ALREADY_CANCELED', 'Trip request is already canceled'))
  })
})
