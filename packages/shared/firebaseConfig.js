import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCgD9KQYCeD-dktU8JhiXGhyaUYhskpMzs",
  authDomain: "rest-platform-9c3cc.firebaseapp.com",
  projectId: "rest-platform-9c3cc",
  storageBucket: "rest-platform-9c3cc.firebasestorage.app",
  messagingSenderId: "1046577303793",
  appId: "1:1046577303793:web:774d5c05a7733f6eff1950"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
