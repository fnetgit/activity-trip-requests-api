import { env } from '#src/config/env'
import { logStartupBanner } from '#src/main/config/startup-banner'
import { buildApp } from '#src/main/factories/http/fastify-app-factory'

export const bootstrap = async (): Promise<void> => {
  logStartupBanner()

  const app = buildApp()

  await app.listen({
    port: env.port,
    host: '0.0.0.0',
  })
}
