import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This is a placeholder structure. You will need to replace it with your actual config.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyC4tdmI-V3QZ6JE2cO7urSqWG-9xMHH23g",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "resuai-da972.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "resuai-da972",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "resuai-da972.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "706099645977",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:706099645977:web:c208115bd7ffcf4ceba488",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GXLG3L1HQV",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
