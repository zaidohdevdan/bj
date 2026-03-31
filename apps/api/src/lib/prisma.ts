import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma = global.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}
