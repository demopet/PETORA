import { z } from "zod";

export const envSchema = z.object({
  VITE_APP_NAME: z.string().default("Petora"),
  VITE_APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  VITE_SUPABASE_URL: z.string().url().default("http://localhost:54321"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default("local-anon-key"),
  VITE_ENABLE_MSW: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  VITE_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(import.meta.env);
