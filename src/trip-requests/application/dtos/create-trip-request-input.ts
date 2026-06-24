export interface CreateTripRequestInput {
  requesterName: string
  origin: string
  destination: string
  departureAt: Date | string
  returnAt: Date | string
  purpose: string
  passengerCount: number
}
