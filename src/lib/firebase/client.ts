import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyBSp4NdZpV0neL2ReBs2yMAwL0w7EfFMCI",
  authDomain: "studio-v44n4.firebaseapp.com",
  projectId: "studio-v44n4",
  storageBucket: "studio-v44n4.firebasestorage.app",
  messagingSenderId: "911617360858",
  appId: "1:911617360858:web:239c2e90ef580ac9f9f6e3"
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

auth = getAuth(app);

export { app, auth };
// NOTE: Firestore (`db`) and Storage come next — added when the scan/upload
// backend lands, together with a `skipLibCheck` review for the firebase types.
