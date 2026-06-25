import { env } from '#src/config/env'

import { logStartupBanner } from './config/startup-banner.js'
import { buildApp } from './factories/http/fastify-app-factory.js'

export const bootstrap = async (): Promise<void> => {
  logStartupBanner()

  const app = buildApp()

  await app.listen({
    port: env.port,
    host: '0.0.0.0',
  })
}
