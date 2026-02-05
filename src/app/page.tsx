
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem, Order, Worker } from '@/types';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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

  const menuItemsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'menu_items') : null, [firestore]);
  const { data: menuItems } = useCollection<MenuItem>(menuItemsQuery);
  
  const workersQuery = useMemoFirebase(() => (firestore && user && currentView === 'admin') ? collection(firestore, 'workers') : null, [firestore, user, currentView]);
  const { data: workers } = useCollection<Worker>(workersQuery);

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
      const workerIdFromEmail = user.email?.split('@')[0].toUpperCase();
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
          toast({ variant: 'destructive', title: 'Login Failed', description: 'No valid worker profile found for this ID.' });
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

    // First, optimistically try to create a user.
    // This is part of the "first-time login" flow.
    try {
      await createUserWithEmailAndPassword(auth, email, password_from_user);
      // If successful, the user is created and signed in.
      // The useEffect hook will then handle validating their worker role.
    } catch (creationError: any) {
      // If user creation fails, it's likely because the user already exists.
      if (creationError.code === 'auth/email-already-in-use') {
        // Now, try to sign in the existing user.
        try {
          await signInWithEmailAndPassword(auth, email, password_from_user);
          // If successful, the useEffect hook will take over.
        } catch (signInError: any) {
          // If sign-in fails, it's most likely an incorrect password.
          if (signInError.code === 'auth/invalid-credential') {
            toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Incorrect password. Please try again.',
            });
          } else {
            // Handle other potential sign-in errors
            toast({
              variant: 'destructive',
              title: 'Login Error',
              description: signInError.message || 'An unexpected error occurred during sign-in.',
            });
          }
        }
      } else if (creationError.code === 'auth/weak-password') {
          toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Password is too weak. It must be at least 6 characters.',
            });
      }
      else {
        // Handle other potential creation errors
        toast({
          variant: 'destructive',
          title: 'Login Error',
          description: creationError.message || 'An unexpected error occurred during account setup.',
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
  
  const handleAddWorker = (newWorker: Omit<Worker, 'id'>) => {
    const docRef = doc(firestore, 'workers', newWorker.workerId);
    setDocumentNonBlocking(docRef, newWorker, {});
     toast({
      title: "Worker Added",
      description: `${newWorker.name} has been added to the system.`,
    });
  };

  const handleUpdateWorker = (updatedWorker: Partial<Worker>) => {
    if (!updatedWorker.id) return;
    const docRef = doc(firestore, 'workers', updatedWorker.id);
    updateDocumentNonBlocking(docRef, updatedWorker);
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
    const workersToShow = workers || [];

    switch (currentView) {
      case 'admin':
        return (
          <AdminPortal
            menuItems={menuItemsToShow}
            workers={workersToShow}
            activeOrders={ordersToShow}
            onLogout={handleLogout}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            onAddWorker={handleAddWorker}
            onUpdateWorker={handleUpdateWorker}
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
