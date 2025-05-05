import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Type definitions for global prisma instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Ensure the environment variable is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL;

// Create Neon adapter
const createNeonAdapter = (connectionString: string) => {
  return new PrismaNeon({ connectionString });
};

// Create Prisma client with Neon adapter
const createPrismaClient = (adapter: PrismaNeon) => {
  return new PrismaClient({ adapter });
};

// Initialize Prisma client
const prisma = globalThis.prisma || createPrismaClient(createNeonAdapter(connectionString));

// Save prisma client to global in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;