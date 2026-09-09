import { cookies } from 'next/headers';
import { verifySessionToken } from './auth';
import { sql } from './db';

export async function getCurrentUser() {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  const [user] = await sql`SELECT id, email, name FROM users WHERE id = ${payload.userId}`;
  return user || null;
}
