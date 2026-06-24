import 'dotenv/config'

export type NodeEnv = 'development' | 'test' | 'production'

export interface Env {
  nodeEnv: NodeEnv
  appName: string
  port: number
  databaseUrl: string
  holidaysApiBaseUrl: string
}

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === 'development' || value === 'test' || value === 'production') {
    return value
  }

  throw new Error(`Invalid NODE_ENV: ${String(value)}`)
}

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/travel_requests'
const DEFAULT_HOLIDAYS_API_BASE_URL = 'https://brasilapi.com.br'

const parsePort = (value: string | undefined): number => {
  const port = Number(value)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('Invalid PORT')
  }

  return port
}

export const env: Env = {
  nodeEnv: parseNodeEnv(process.env['NODE_ENV'] ?? 'development'),
  appName: process.env['APP_NAME'] ?? 'ts-project',
  port: parsePort(process.env['PORT'] ?? '3000'),
  databaseUrl: process.env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL,
  holidaysApiBaseUrl: process.env['HOLIDAYS_API_BASE_URL'] ?? DEFAULT_HOLIDAYS_API_BASE_URL,
}
