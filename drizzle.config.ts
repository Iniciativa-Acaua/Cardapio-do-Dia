// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

// O drizzle-kit não lê o .env.local do Next sozinho (Node 20.12+)
try {
  process.loadEnvFile(".env.local");
} catch {}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts", // <- só o index, que já reexporta tudo
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});