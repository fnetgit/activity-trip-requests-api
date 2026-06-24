import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { env } from '#src/config/env'

let prismaClient: PrismaClient | undefined

export const getPrismaClient = (): PrismaClient => {
  prismaClient ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.databaseUrl,
    }),
  })

  return prismaClient
}
