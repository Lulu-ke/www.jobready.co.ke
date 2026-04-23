import { PrismaClient } from '@prisma/client'

// Force the correct MySQL URL, overriding any system-level env var
const DATABASE_URL = 'mysql://jobready_database_admin:Amush%40100%25@da27.host-ww.net/jobready_database'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
