import "server-only";

/**
 * Server-only Firebase ID-token verification.
 *
 * The browser sends the user's Firebase ID token with every scan request; we
 * validate it against Google's Identity Toolkit before touching the AI key, so
 * the key is never reachable by anonymous callers.
 *
 * Uses the public `accounts:lookup` REST endpoint (auth'd with the same web API
 * key the client already uses) so the demo needs no service-account JSON.
 */

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export interface DecodedToken {
  uid: string;
  email?: string;
}

export async function verifyIdToken(idToken: string): Promise<DecodedToken | null> {
  if (!apiKey || !idToken) return null;
  try {
    const res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: { localId: string; email?: string }[] };
    const user = data.users?.[0];
    if (!user?.localId) return null;
    return { uid: user.localId, email: user.email };
  } catch {
    return null;
  }
}
