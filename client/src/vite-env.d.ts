/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WEBPAGE_URL: string
    readonly VITE_RELEASE_VERSION: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
