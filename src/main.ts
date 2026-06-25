import { fileURLToPath } from 'node:url'

import { bootstrap } from './main/bootstrap.js'

export { bootstrap } from './main/bootstrap.js'
export { logStartupBanner } from './main/config/startup-banner.js'
export { buildApp } from './main/factories/http/fastify-app-factory.js'
export type { BuildAppDependencies } from './main/factories/trip-requests/build-app-dependencies.js'

const isEntrypoint = (): boolean => {
  const entrypoint = process.argv[1]

  if (entrypoint === undefined) {
    return false
  }

  return fileURLToPath(import.meta.url) === entrypoint
}

if (isEntrypoint()) {
  bootstrap().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
