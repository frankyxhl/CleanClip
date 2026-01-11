/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLEANCLIP_DEBUG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
