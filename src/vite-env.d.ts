/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_PUBLIC_POCKETBASE_URL: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
