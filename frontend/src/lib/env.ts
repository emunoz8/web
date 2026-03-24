const readEnvValue = (...values: Array<string | undefined>): string =>
  values.find((value) => typeof value === "string" && value.trim() !== "")?.trim() ?? "";

export const apiBaseEnv = readEnvValue(import.meta.env.VITE_API_BASE_URL);

export const googleClientIdEnv = readEnvValue(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export const auxApiBaseEnv = readEnvValue(import.meta.env.VITE_AUX_API_BASE_URL, apiBaseEnv);

export const auxApiPrefixEnv = readEnvValue(import.meta.env.VITE_AUX_API_PREFIX);
