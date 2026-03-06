import * as jose from 'jose';

const secret = new TextEncoder().encode('very very very very very long and safe secret phrase');

export type JwtPayload = { id: string; email: string };

const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

export const signAccessToken = async (payload: JwtPayload) => {
  const jwt = new jose.SignJWT(payload);
  jwt.setProtectedHeader({ alg: 'HS256' });
  jwt.setExpirationTime(ACCESS_TTL);
  return jwt.sign(secret);
};

export const signRefreshToken = async (payload: JwtPayload) => {
  const jwt = new jose.SignJWT(payload);
  jwt.setProtectedHeader({ alg: 'HS256' });
  jwt.setExpirationTime(REFRESH_TTL);
  return jwt.sign(secret);
};

export const verify = async (token: string) => {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
};
