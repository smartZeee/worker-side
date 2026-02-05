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
    const savedEmployeeId = localStorage.getItem(EMPLOYEE_ID_STORAGE_KEY);
    if (savedEmployeeId && user) {
        // If there's a logged in user and a saved ID, validate and set view
        getDoc(doc(firestore, 'workers', savedEmployeeId.toUpperCase())).then(workerDoc => {
            if(workerDoc.exists()) {
                const workerData = workerDoc.data() as Worker;
                if (workerData.role === 'admin') {
                    setCurrentView('admin');
                } else {
                    setCurrentView('worker');
                }
                setEmployeeId(savedEmployeeId);
            } else {
                handleLogout();
            }
        });
    }
  }, [user]);

  const handleLogin = async (id: string, password_from_user: string) => {
    const upperId = id.toUpperCase();
    const email = `${upperId}@culinaryflow.app`;

    try {
      // 1. Check if worker exists and is active in Firestore
      const workerDocRef = doc(firestore, 'workers', upperId);
      const workerDoc = await getDoc(workerDocRef);

      if (!workerDoc.exists()) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Employee ID not found.',
        });
        return;
      }
      
      const workerData = workerDoc.data() as Worker;
      if (!workerData.isActive) {
         toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'This employee account is inactive.',
        });
        return;
      }

      // 2. Try to sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password_from_user);
      
      // 3. Set view based on role
      if (workerData.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('worker');
      }
      setEmployeeId(upperId);
      localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, upperId);

    } catch (error: any) {
      // 4. If user not found, create them in Firebase Auth and retry
      if (error.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password_from_user);
          await handleLogin(id, password_from_user); // Retry login after sign up
        } catch (signUpError: any) {
          toast({
            variant: 'destructive',
            title: 'Setup Failed',
            description: `Could not create a new account: ${signUpError.message}`,
          });
        }
      } else {
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
