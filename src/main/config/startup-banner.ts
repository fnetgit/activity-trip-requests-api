/* eslint-disable no-console */
import { env } from '#src/config/env'

export const logStartupBanner = (): void => {
  console.log(`[${env.appName}] starting application`)
  console.log(`Environment: ${env.nodeEnv}`)
  console.log(`Port: ${String(env.port)}`)
}
