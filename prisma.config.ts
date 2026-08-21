import "dotenv/config";
import { defineConfig } from "prisma/config";

// Note: this file configures the Prisma CLI only (generate / migrate / db push).
// The application itself connects via the official PostgreSQL driver adapter
// (@prisma/adapter-pg) — see src/lib/db/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
