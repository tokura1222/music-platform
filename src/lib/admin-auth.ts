import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_EXPIRY = 60 * 60 * 24; // 24 hours in seconds

function getSecret(): string {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) throw new Error('ADMIN_SECRET environment variable is not set');
    return secret;
}

/**
 * Create a signed session token using HMAC-SHA256.
 */
export function createSessionToken(): string {
    const payload = JSON.stringify({
        role: 'admin',
        exp: Date.now() + SESSION_EXPIRY * 1000,
    });
    const base64Payload = Buffer.from(payload).toString('base64url');
    const signature = crypto
        .createHmac('sha256', getSecret())
        .update(base64Payload)
        .digest('base64url');
    return `${base64Payload}.${signature}`;
}

/**
 * Verify a signed session token. Returns true if valid and not expired.
 */
export function verifySessionToken(token: string): boolean {
    try {
        const [base64Payload, signature] = token.split('.');
        if (!base64Payload || !signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', getSecret())
            .update(base64Payload)
            .digest('base64url');

        if (signature !== expectedSignature) return false;

        const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString());
        if (payload.exp < Date.now()) return false;
        if (payload.role !== 'admin') return false;

        return true;
    } catch {
        return false;
    }
}

/**
 * Verify the current request has a valid admin session.
 * Use in API routes and server components.
 */
export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifySessionToken(token);
}

/**
 * Set the admin session cookie.
 */
export async function setAdminSessionCookie(): Promise<void> {
    const token = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_EXPIRY,
    });
}

/**
 * Clear the admin session cookie.
 */
export async function clearAdminSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Validate admin credentials against environment variables.
 */
export function validateCredentials(username: string, password: string): boolean {
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminUser || !adminPass) return false;

    // Timing-safe comparison
    const userMatch =
        username.length === adminUser.length &&
        crypto.timingSafeEqual(Buffer.from(username), Buffer.from(adminUser));
    const passMatch =
        password.length === adminPass.length &&
        crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPass));

    return userMatch && passMatch;
}
