/// <reference types="vite/client" />

// Extend Vite's environment typing with our custom variables.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly API_BASE_URL?: string;
}
