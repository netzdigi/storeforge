import { SignJWT, jwtVerify } from 'jose';

function encodedSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function createSessionToken(userId) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encodedSecret());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret());
    return payload;
  } catch {
    return null;
  }
}
