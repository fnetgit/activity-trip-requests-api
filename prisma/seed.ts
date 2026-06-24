import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Prisma } from '@prisma/client'

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/travel_requests'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
  }),
})

const tripRequests: Prisma.TripRequestCreateInput[] = [
  {
    id: 'seed-trip-request-001',
    requesterName: 'Maria Silva',
    origin: 'Parnaiba',
    destination: 'Teresina',
    departureAt: '2026-06-24T10:00:00.000Z',
    returnAt: '2026-06-24T18:00:00.000Z',
    purpose: 'Participation in an institutional meeting',
    passengerCount: 3,
    status: 'pending',
    createdAt: '2026-06-20T14:30:00.000Z',
  },
  {
    id: 'seed-trip-request-002',
    requesterName: 'Joao Pereira',
    origin: 'Teresina',
    destination: 'Floriano',
    departureAt: '2026-06-25T09:00:00.000Z',
    returnAt: '2026-06-25T20:00:00.000Z',
    purpose: 'Teaching activity supervision',
    passengerCount: 2,
    status: 'pending',
    createdAt: '2026-06-20T15:00:00.000Z',
  },
  {
    id: 'seed-trip-request-003',
    requesterName: 'Ana Costa',
    origin: 'Picos',
    destination: 'Teresina',
    departureAt: '2026-06-26T08:00:00.000Z',
    returnAt: '2026-06-27T17:00:00.000Z',
    purpose: 'Extension project activity',
    passengerCount: 4,
    status: 'pending',
    createdAt: '2026-06-21T09:15:00.000Z',
  },
  {
    id: 'seed-trip-request-004',
    requesterName: 'Carlos Mendes',
    origin: 'Teresina',
    destination: 'Piripiri',
    departureAt: '2026-06-27T11:00:00.000Z',
    returnAt: '2026-06-27T19:00:00.000Z',
    purpose: 'Administrative visit',
    passengerCount: 1,
    status: 'canceled',
    createdAt: '2026-06-21T10:00:00.000Z',
  },
  {
    id: 'seed-trip-request-005',
    requesterName: 'Fernanda Rocha',
    origin: 'Campo Maior',
    destination: 'Teresina',
    departureAt: '2026-06-28T12:00:00.000Z',
    returnAt: '2026-06-28T22:00:00.000Z',
    purpose: 'Research group meeting',
    passengerCount: 5,
    status: 'pending',
    createdAt: '2026-06-21T11:45:00.000Z',
  },
  {
    id: 'seed-trip-request-006',
    requesterName: 'Rafael Lima',
    origin: 'Teresina',
    destination: 'Oeiras',
    departureAt: '2026-06-29T07:30:00.000Z',
    returnAt: '2026-06-29T18:30:00.000Z',
    purpose: 'Institutional planning session',
    passengerCount: 3,
    status: 'pending',
    createdAt: '2026-06-21T13:20:00.000Z',
  },
  {
    id: 'seed-trip-request-007',
    requesterName: 'Patricia Sousa',
    origin: 'Sao Raimundo Nonato',
    destination: 'Teresina',
    departureAt: '2026-06-30T10:30:00.000Z',
    returnAt: '2026-07-01T15:30:00.000Z',
    purpose: 'Academic event participation',
    passengerCount: 2,
    status: 'pending',
    createdAt: '2026-06-21T14:10:00.000Z',
  },
  {
    id: 'seed-trip-request-008',
    requesterName: 'Lucas Almeida',
    origin: 'Teresina',
    destination: 'Bom Jesus',
    departureAt: '2026-07-02T08:45:00.000Z',
    returnAt: '2026-07-03T16:45:00.000Z',
    purpose: 'Campus administrative support',
    passengerCount: 4,
    status: 'pending',
    createdAt: '2026-06-21T16:00:00.000Z',
  },
  {
    id: 'seed-trip-request-009',
    requesterName: 'Juliana Martins',
    origin: 'Corrente',
    destination: 'Teresina',
    departureAt: '2026-07-04T09:20:00.000Z',
    returnAt: '2026-07-04T21:20:00.000Z',
    purpose: 'Curriculum committee meeting',
    passengerCount: 2,
    status: 'canceled',
    createdAt: '2026-06-22T08:00:00.000Z',
  },
  {
    id: 'seed-trip-request-010',
    requesterName: 'Bruno Oliveira',
    origin: 'Teresina',
    destination: 'Urucui',
    departureAt: '2026-07-05T13:00:00.000Z',
    returnAt: '2026-07-05T23:00:00.000Z',
    purpose: 'Infrastructure inspection',
    passengerCount: 3,
    status: 'pending',
    createdAt: '2026-06-22T09:30:00.000Z',
  },
]

for (const tripRequest of tripRequests) {
  await prisma.tripRequest.upsert({
    where: {
      id: tripRequest.id,
    },
    update: tripRequest,
    create: tripRequest,
  })
}

await prisma.$disconnect()
