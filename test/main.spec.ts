import process from 'node:process'

import type * as EnvModule from '#src/config/env'
import type * as MainModule from '#src/main'

const originalEnv = { ...process.env }

const restoreEnv = (): void => {
  process.env = { ...originalEnv }
}

const clearAppEnv = (): void => {
  delete process.env['NODE_ENV']
  delete process.env['APP_NAME']
  delete process.env['PORT']
  delete process.env['DATABASE_URL']
  delete process.env['HOLIDAYS_API_BASE_URL']
}

const loadEnvModule = async (): Promise<typeof EnvModule> => {
  vi.resetModules()

  return import('#src/config/env')
}

const loadMainModule = async (): Promise<typeof MainModule> => {
  vi.resetModules()

  return import('#src/main')
}

describe('environment configuration', () => {
  beforeEach(() => {
    restoreEnv()
    clearAppEnv()
  })

  afterEach(() => {
    restoreEnv()
    vi.restoreAllMocks()
  })

  it('uses safe defaults when environment variables are missing', async () => {
    const { env } = await loadEnvModule()

    expect(env).toStrictEqual({
      nodeEnv: 'development',
      appName: 'ts-project',
      port: 3000,
      databaseUrl: 'postgresql://postgres:postgres@localhost:5432/travel_requests',
      holidaysApiBaseUrl: 'https://brasilapi.com.br',
    })
  })

  it('parses valid environment variables', async () => {
    process.env['NODE_ENV'] = 'production'
    process.env['APP_NAME'] = 'professional-template'
    process.env['PORT'] = '8080'
    process.env['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/custom_db'
    process.env['HOLIDAYS_API_BASE_URL'] = 'https://example.com'

    const { env } = await loadEnvModule()

    expect(env).toStrictEqual({
      nodeEnv: 'production',
      appName: 'professional-template',
      port: 8080,
      databaseUrl: 'postgresql://postgres:postgres@localhost:5432/custom_db',
      holidaysApiBaseUrl: 'https://example.com',
    })
  })

  it('throws for an invalid NODE_ENV', async () => {
    Reflect.set(process.env, 'NODE_ENV', 'prod')

    await expect(loadEnvModule()).rejects.toThrow('Invalid NODE_ENV: prod')
  })

  it('throws for an invalid PORT', async () => {
    process.env['NODE_ENV'] = 'test'
    process.env['PORT'] = '0'

    await expect(loadEnvModule()).rejects.toThrow('Invalid PORT')
  })
})

describe('bootstrap', () => {
  beforeEach(() => {
    restoreEnv()
    process.env['NODE_ENV'] = 'test'
    process.env['APP_NAME'] = 'ts-project'
    process.env['PORT'] = '3000'
  })

  afterEach(() => {
    restoreEnv()
    vi.restoreAllMocks()
  })

  it('logs the startup banner', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const { logStartupBanner } = await loadMainModule()

    logStartupBanner()

    expect(logSpy).toHaveBeenNthCalledWith(1, '[ts-project] starting application')
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Environment: test')
    expect(logSpy).toHaveBeenNthCalledWith(3, 'Port: 3000')
  })
})
