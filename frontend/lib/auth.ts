import Cookies from 'js-cookie';
import api from './api';

const ACCESS_EXPIRY_DAYS  = 1 / 24; // 1 hour, matches server ACCESS_TOKEN_LIFETIME
const REFRESH_EXPIRY_DAYS = 7;
const REMEMBER_EXPIRY_DAYS = 30;

export async function login(username: string, password: string, remember = false): Promise<void> {
  const { data } = await api.post('/token/', { username, password });
  Cookies.set('access_token', data.access, { expires: ACCESS_EXPIRY_DAYS, sameSite: 'strict' });
  // remember = true  → persistent 30-day cookie
  // remember = false → session cookie (cleared when browser closes)
  Cookies.set('refresh_token', data.refresh, {
    expires: remember ? REMEMBER_EXPIRY_DAYS : undefined,
    sameSite: 'strict',
  });
}

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = Cookies.get('refresh_token');
  if (!refresh) return null;
  try {
    const { data } = await api.post('/token/refresh/', { refresh });
    Cookies.set('access_token', data.access, {
      expires: ACCESS_EXPIRY_DAYS,
      sameSite: 'strict',
    });
    return data.access;
  } catch {
    return null;
  }
}

export function logout(): void {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
}

export function getAccessToken(): string | undefined {
  return Cookies.get('access_token');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
