import 'dotenv/config'

import { defineConfig } from 'prisma/config'

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/travel_requests'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --experimental-transform-types --conditions=development prisma/seed.ts',
  },
})
