/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_AUX_API_BASE_URL?: string;
  readonly VITE_AUX_API_PREFIX?: string;
  readonly REACT_APP_API_BASE_URL?: string;
  readonly REACT_APP_GOOGLE_CLIENT_ID?: string;
  readonly REACT_APP_AUX_API_BASE_URL?: string;
  readonly REACT_APP_AUX_API_PREFIX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
