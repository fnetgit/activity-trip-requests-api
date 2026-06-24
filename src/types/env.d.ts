declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production'
    APP_NAME?: string
    PORT?: `${number}`
    DATABASE_URL?: string
    HOLIDAYS_API_BASE_URL?: string
  }
}
