"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem, Order } from '@/types';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';
import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
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
    if (savedEmployeeId) {
      handleLogin(savedEmployeeId, true);
    }
  }, []);

  const handleLogin = async (id: string, isAutoLogin = false) => {
    const upperId = id.toUpperCase();
    const email = `${id}@culinaryflow.app`;
    const password = `${id}-password`;

    try {
      if (!isAutoLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      if (upperId.startsWith('AD')) {
        setEmployeeId(id);
        setCurrentView('admin');
        localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, id);
      } else if (upperId.startsWith('WK')) {
        setEmployeeId(id);
        setCurrentView('worker');
        localStorage.setItem(EMPLOYEE_ID_STORAGE_KEY, id);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid Employee ID',
          description: "Please use 'AD...' for Admin or 'WK...' for Worker.",
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' && !isAutoLogin) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          handleLogin(id); // Retry login after sign up
        } catch (signUpError) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Could not log in or create a new account.',
          });
        }
      } else if (!isAutoLogin) {
        toast({
          variant: 'destructive',
          title: 'Invalid Employee ID or Password',
          description: "There was an issue logging in.",
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
        return <LoginScreen onLogin={(id) => handleLogin(id)} />;
    }
  };

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center">
      {renderView()}
    </main>
  );
}
