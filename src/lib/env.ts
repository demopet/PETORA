import { z } from 'zod';

export const envSchema = z.object({
  VITE_APP_NAME: z.string(),
  VITE_APP_ENV: z.enum(['local', 'staging', 'production']),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_ENABLE_MSW: z.string().transform(v => v === 'true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  VITE_ENABLE_DEVTOOLS: z.string().transform(v => v === 'true'),
});

export const env = envSchema.parse(import.meta.env);
