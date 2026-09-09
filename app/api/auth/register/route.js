import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function POST(request) {
  const { email, password, name } = await request.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Имейл и парола с поне 8 символа са задължителни.' },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Този имейл вече е регистриран.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${normalizedEmail}, ${passwordHash}, ${name || null})
    RETURNING id
  `;

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
