import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'E-Mail und Passwort sind erforderlich.' }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const [user] = await sql`SELECT id, password_hash FROM users WHERE email = ${normalizedEmail}`;
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: 'E-Mail oder Passwort ist falsch.' }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
