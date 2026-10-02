import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase config comes from env vars (see .env.example).
// All keys use the NEXT_PUBLIC_ prefix so Next.js exposes them to the browser.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

/**
 * Initialises Firebase lazily.
 *
 * This must NOT throw at module scope: Next.js imports client modules during
 * `next build` (static prerendering) and during server rendering, where the
 * browser env vars may not be present yet. Throwing here used to fail the whole
 * production build with "Missing Firebase config" on every route.
 */
function ensureApp(): FirebaseApp {
  if (app) return app;
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    throw new Error(
      "Missing Firebase config. Copy .env.example to .env.local and fill in your Firebase Console values."
    );
  }
  app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
  return app;
}

/** Returns the shared Auth instance, creating it on first use. */
export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(ensureApp());
  return authInstance;
}

/**
 * Drop-in `auth` for existing call sites. Every property access initialises
 * Firebase on the client, and server-side reads return null instead of
 * crashing the build.
 */
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (typeof window === "undefined") {
      // Server render / build: expose nulls so nothing throws during prerender.
      return null;
    }
    const instance = getFirebaseAuth() as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  }
}) as Auth;

// NOTE: Firestore (`db`) and Storage come next — added when the scan/upload
// backend lands, together with a `skipLibCheck` review for the firebase types.
