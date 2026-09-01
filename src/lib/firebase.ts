import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Force Google prompt account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const SUPER_ADMIN_EMAIL = 'martindperez@gmail.com';

export interface AppUser {
  email: string;
  role: 'admin' | 'evaluator' | 'viewer';
  displayName?: string;
  photoURL?: string;
  status: 'active' | 'inactive' | 'pending';
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AccessRequest {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}
