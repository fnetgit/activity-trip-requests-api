import { fileURLToPath } from 'node:url'

import { bootstrap } from '#src/main/bootstrap'

export { bootstrap } from '#src/main/bootstrap'
export { logStartupBanner } from '#src/main/config/startup-banner'
export { buildApp } from '#src/main/factories/http/fastify-app-factory'
export type { BuildAppDependencies } from '#src/main/factories/trip-requests/build-app-dependencies'

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
