
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem, Order, Worker } from '@/types';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

type View = 'login' | 'admin' | 'worker';

const EMPLOYEE_ID_STORAGE_KEY = 'culinaryFlowEmployeeId';

export default function Home() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('login');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const firestore = useFirestore();
  const auth = useAuth();
  const { user } = useAuth();

  const menuItemsQuery = useMemoFirebase(() => collection(firestore, 'menu_items'), [firestore]);
  const { data: menuItems } = useCollection<MenuItem>(menuItemsQuery);

  const ordersQuery = useMemoFirebase(
    () => (employeeId ? collection(firestore, 'workers', employeeId, 'orders') : null),
    [firestore, employeeId]
  );
  const { data: activeOrders } = useCollection<Order>(ordersQuery);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (user && firestore) {
      const workerIdFromEmail = user.email?.split('@')[0];
      if (!workerIdFromEmail) {
        handleLogout();
        return;
      }
      
      const workerDocRef = doc(firestore, 'workers', workerIdFromEmail);
      getDoc(workerDocRef).then(workerDoc => {
        if (workerDoc.exists()) {
          const workerData = workerDoc.data() as Worker;
          if (!workerData.isActive) {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'This employee account is inactive.' });
            handleLogout();
            return;
          }

          if (workerData.role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('worker');
          }
          setEmployeeId(workerIdFromEmail);
          localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, workerIdFromEmail);
        } else {
          toast({ variant: 'destructive', title: 'Login Failed', description: 'No valid worker profile found.' });
          handleLogout();
        }
      }).catch(error => {
        console.error("Error fetching worker profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch worker profile.' });
        handleLogout();
      });
    } else if (!user) {
        const savedId = localStorage.getItem(EMPLOYEE_ID_STORAGE_KEY);
        if (savedId) {
             handleLogout();
        } else {
            setCurrentView('login');
        }
    }
  }, [user, firestore]);

  const handleLogin = async (id: string, password_from_user: string) => {
    const upperId = id.toUpperCase();
    const email = `${upperId}@culinaryflow.app`;

    try {
      // First, just try to sign in. The useEffect will handle the rest.
      await signInWithEmailAndPassword(auth, email, password_from_user);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If the user doesn't exist in Auth, we'll try to create them.
        // The useEffect will then validate if they are a valid worker in Firestore.
        try {
          await createUserWithEmailAndPassword(auth, email, password_from_user);
          // On success, the `user` state will change, and the useEffect will run.
        } catch (signUpError: any) {
          toast({
            variant: 'destructive',
            title: 'Sign-up Failed',
            description: 'This ID may be in use with a different password, or another error occurred.',
          });
        }
      } else {
        // Handle other auth errors like wrong password.
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message || "An unexpected error occurred.",
        });
      }
    }
  };


  const handleLogout = () => {
    auth.signOut();
    setEmployeeId(null);
    setCurrentView('login');
    localStorage.removeItem(EMPLOYEE_ID_STORAGE_KEY);
  };

  const handleUpdateMenuItem = (updatedItem: Partial<MenuItem>) => {
    if (!updatedItem.id) return;
    const docRef = doc(firestore, 'menu_items', updatedItem.id);
    updateDocumentNonBlocking(docRef, {
      ...updatedItem,
      updatedAt: serverTimestamp(),
    });
  };

  const handleAddMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const collectionRef = collection(firestore, 'menu_items');
    addDocumentNonBlocking(collectionRef, {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    if (!employeeId) return;
    const docRef = doc(firestore, 'workers', employeeId, 'orders', orderId);
    updateDocumentNonBlocking(docRef, { status: newStatus });
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  const renderView = () => {
    const ordersToShow = activeOrders || [];
    const menuItemsToShow = menuItems || [];

    switch (currentView) {
      case 'admin':
        return (
          <AdminPortal
            menuItems={menuItemsToShow}
            activeOrders={ordersToShow}
            onLogout={handleLogout}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            employeeId={employeeId || ''}
          />
        );
      case 'worker':
        return (
          <WorkerPortal
            menuItems={menuItemsToShow}
            activeOrders={ordersToShow}
            onLogout={handleLogout}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            employeeId={employeeId || ''}
          />
        );
      case 'login':
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center">
      {renderView()}
    </main>
  );
}
