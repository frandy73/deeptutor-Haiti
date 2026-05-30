import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type UserProfile = {
  uid: string;
  isPremium: boolean;
  dailyMessagesCount: number;
  lastMessageDate: string; // YYYY-MM-DD
};

const firebaseConfig = {
  apiKey: "AIzaSyDYhme97KcyeUfioZ1Uo8Q0Pc_rWpKTDIQ",
  authDomain: "pwof-ou-ayiti.firebaseapp.com",
  projectId: "pwof-ou-ayiti",
  storageBucket: "pwof-ou-ayiti.firebasestorage.app",
  messagingSenderId: "950251789839",
  appId: "1:950251789839:web:24f1d6355833f83e7ccd7a"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const initFirebase = async () => {
  return { app, auth, db, storage };
};

export const loginWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not initialized');
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase not initialized');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create default free profile in Firestore
  const today = new Date().toISOString().split('T')[0];
  const userProfile: UserProfile = {
    uid: userCredential.user.uid,
    isPremium: false,
    dailyMessagesCount: 0,
    lastMessageDate: today
  };
  
  await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
  return userCredential;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch {
    // Offline or Firestore error - return default profile
    return {
      uid,
      isPremium: false,
      dailyMessagesCount: 0,
      lastMessageDate: new Date().toISOString().split('T')[0]
    };
  }
};

export const checkAndIncrementMessageLimit = async (uid: string, isPremium: boolean): Promise<boolean> => {
  if (isPremium) return true; // Unlimited

  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    const profile = docSnap.data() as UserProfile;
    const today = new Date().toISOString().split('T')[0];
    
    // Reset if it's a new day
    if (profile.lastMessageDate !== today) {
      await updateDoc(docRef, {
        dailyMessagesCount: 1,
        lastMessageDate: today
      });
      return true;
    }
    
    // Enforce limit: 30 messages/day for free users
    if (profile.dailyMessagesCount >= 30) {
      return false; // Limit reached
    }
    
    await updateDoc(docRef, {
      dailyMessagesCount: profile.dailyMessagesCount + 1
    });
    
    return true; // Allowed
  } catch {
    // Offline - allow message to pass through
    return true;
  }
};

export const logoutUser = async () => {
  if (!auth) return;
  return signOut(auth);
};

export const onAuthChange = async (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
