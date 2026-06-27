import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

const connectionString = process.env.DATABASE_URL;

// Create a placeholder client for build time
const client = connectionString
  ? postgres(connectionString)
  : postgres('postgresql://placeholder:placeholder@placeholder:5432/placeholder');

export const db = drizzle(client, { schema });

export type Database = typeof db;