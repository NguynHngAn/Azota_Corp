// Extend Vite's environment typing with our custom variable.
interface ImportMetaEnv {
  readonly API_BASE_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
