// Build DATABASE_URL from raw credentials — no manual URL-encoding needed.
// If DATABASE_URL is already set (e.g. by Vercel or set-db-url.js), use it directly.
// Otherwise construct it from DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS.
function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const host = process.env.DB_HOST
  const port = process.env.DB_PORT || '3306'
  const name = process.env.DB_NAME
  const user = process.env.DB_USER
  const pass = process.env.DB_PASS

  if (!host || !name || !user) {
    throw new Error(
      'Missing database config. Set DB_HOST, DB_NAME, DB_USER (and optionally DB_PORT, DB_PASS) in .env, or set DATABASE_URL directly.',
    )
  }

  const encoded = (v: string) =>
    encodeURIComponent(v).replace(/%3A/g, ':')

  return `mysql://${encoded(user)}:${encoded(pass)}@${host}:${port}/${name}`
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = buildDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
