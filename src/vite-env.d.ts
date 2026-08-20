/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ATS_sheet?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
