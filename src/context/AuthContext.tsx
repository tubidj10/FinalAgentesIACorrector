import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logoutUser, 
  SUPER_ADMIN_EMAIL, 
  AppUser, 
  AccessRequest 
} from '../lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
  hasPendingRequest: boolean;
  usersList: AppUser[];
  pendingRequests: AccessRequest[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  submitAccessRequest: () => Promise<void>;
  createUser: (email: string, role: 'admin' | 'evaluator' | 'viewer', displayName?: string) => Promise<void>;
  setUserStatus: (email: string, status: 'active' | 'inactive') => Promise<void>;
  setUserRole: (email: string, role: 'admin' | 'evaluator' | 'viewer') => Promise<void>;
  removeUser: (email: string) => Promise<void>;
  approveAccessRequest: (request: AccessRequest, role?: 'admin' | 'evaluator' | 'viewer') => Promise<void>;
  rejectAccessRequest: (requestId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasPendingRequest, setHasPendingRequest] = useState<boolean>(false);
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);

  const isSuperAdmin = Boolean(
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(
    isSuperAdmin || (appUser && appUser.role === 'admin' && appUser.status === 'active')
  );

  const isAuthorized = Boolean(
    isSuperAdmin || (appUser && appUser.status === 'active')
  );

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser || !currentUser.email) {
        setAppUser(null);
        setHasPendingRequest(false);
        setLoading(false);
        return;
      }

      const emailKey = currentUser.email.toLowerCase();

      // If Super Admin, initialize or update superadmin profile
      if (emailKey === SUPER_ADMIN_EMAIL.toLowerCase()) {
        const superAdminProfile: AppUser = {
          email: currentUser.email,
          displayName: currentUser.displayName || 'Super Admin',
          photoURL: currentUser.photoURL || undefined,
          role: 'admin',
          status: 'active',
          createdBy: 'system'
        };
        setAppUser(superAdminProfile);
        
        try {
          const userDocRef = doc(db, 'users', emailKey);
          await setDoc(userDocRef, {
            ...superAdminProfile,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('Error syncing superadmin document:', e);
        }

        setLoading(false);
        return;
      }

      // For standard users, listen to their user doc
      try {
        const userDocRef = doc(db, 'users', emailKey);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data() as AppUser;
          setAppUser(userData);
          setHasPendingRequest(false);
        } else {
          setAppUser(null);
          // Check if there is an existing access request
          const reqDocRef = doc(db, 'access_requests', emailKey);
          const reqSnap = await getDoc(reqDocRef);
          if (reqSnap.exists()) {
            const reqData = reqSnap.data() as AccessRequest;
            setHasPendingRequest(reqData.status === 'pending');
          } else {
            setHasPendingRequest(false);
          }
        }
      } catch (err) {
        console.error('Error fetching user access status:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to users list and access requests if user is Admin
  useEffect(() => {
    if (!isAdmin || !user) {
      setUsersList([]);
      setPendingRequests([]);
      return;
    }

    // Subscribe to users collection
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersColRef, (snapshot) => {
      const list: AppUser[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as AppUser);
      });
      setUsersList(list);
    }, (error) => {
      console.warn('Error subscribing to users:', error);
    });

    // Subscribe to access_requests collection
    const reqColRef = collection(db, 'access_requests');
    const unsubReqs = onSnapshot(reqColRef, (snapshot) => {
      const list: AccessRequest[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as AccessRequest;
        list.push({ ...data, id: d.id });
      });
      setPendingRequests(list.filter(r => r.status === 'pending'));
    }, (error) => {
      console.warn('Error subscribing to requests:', error);
    });

    return () => {
      unsubUsers();
      unsubReqs();
    };
  }, [isAdmin, user]);

  const login = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setAppUser(null);
      setUsersList([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const submitAccessRequest = async () => {
    if (!user || !user.email) return;
    const emailKey = user.email.toLowerCase();
    const reqRef = doc(db, 'access_requests', emailKey);
    const reqData: AccessRequest = {
      id: emailKey,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL || undefined,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    await setDoc(reqRef, reqData);
    setHasPendingRequest(true);
  };

  const createUser = async (email: string, role: 'admin' | 'evaluator' | 'viewer', displayName?: string) => {
    if (!isAdmin || !email.trim()) return;
    const emailKey = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', emailKey);
    const newUser: AppUser = {
      email: email.trim().toLowerCase(),
      role,
      displayName: displayName?.trim() || email.split('@')[0],
      status: 'active',
      createdBy: user?.email || SUPER_ADMIN_EMAIL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userDocRef, newUser);

    // If an access request existed for this user, mark it approved
    try {
      const reqRef = doc(db, 'access_requests', emailKey);
      await updateDoc(reqRef, { status: 'approved' });
    } catch {}
  };

  const setUserStatus = async (email: string, status: 'active' | 'inactive') => {
    if (!isAdmin || !email) return;
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return; // Cannot deactivate superadmin
    const emailKey = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', emailKey);
    await updateDoc(userDocRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  };

  const setUserRole = async (email: string, role: 'admin' | 'evaluator' | 'viewer') => {
    if (!isAdmin || !email) return;
    const emailKey = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', emailKey);
    await updateDoc(userDocRef, {
      role,
      updatedAt: new Date().toISOString()
    });
  };

  const removeUser = async (email: string) => {
    if (!isAdmin || !email) return;
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return; // Cannot remove superadmin
    const emailKey = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', emailKey);
    await deleteDoc(userDocRef);
  };

  const approveAccessRequest = async (request: AccessRequest, role: 'admin' | 'evaluator' | 'viewer' = 'evaluator') => {
    if (!isAdmin) return;
    await createUser(request.email, role, request.displayName);
    const reqRef = doc(db, 'access_requests', request.id);
    await updateDoc(reqRef, { status: 'approved' });
  };

  const rejectAccessRequest = async (requestId: string) => {
    if (!isAdmin) return;
    const reqRef = doc(db, 'access_requests', requestId);
    await updateDoc(reqRef, { status: 'rejected' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      appUser,
      loading,
      isSuperAdmin,
      isAdmin,
      isAuthorized,
      hasPendingRequest,
      usersList,
      pendingRequests,
      login,
      logout,
      submitAccessRequest,
      createUser,
      setUserStatus,
      setUserRole,
      removeUser,
      approveAccessRequest,
      rejectAccessRequest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
