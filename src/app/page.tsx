"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem, Order, Worker } from '@/types';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';
import { initializeFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, getDocs, query } from 'firebase/firestore';

type View = 'login' | 'admin' | 'worker';

export default function Home() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('login');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Firestore data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { firestore } = initializeFirebase();

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load menu items
        const menuSnapshot = await getDocs(collection(firestore, 'menu'));
        const menuData = menuSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(menuData);

        // Load workers/employees
        const employeeSnapshot = await getDocs(collection(firestore, 'employee'));
        const employeeData = employeeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Worker[];
        setWorkers(employeeData);

        // Load orders (optional)
        const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setActiveOrders(ordersData);
        
      } catch (error) {
        console.error('Error loading data from Firestore:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load data from database.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isClient) {
      loadData();
    }
  }, [isClient, firestore, toast]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshWorkers = async () => {
    try {
      const employeeSnapshot = await getDocs(collection(firestore, 'employee'));
      const employeeData = employeeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Worker[];
      setWorkers(employeeData);
    } catch (error) {
      console.error('Error refreshing workers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to refresh workers.',
      });
    }
  };

  const refreshMenuItems = async () => {
    try {
      const menuSnapshot = await getDocs(collection(firestore, 'menu'));
      const menuData = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error refreshing menu items:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to refresh menu items.',
      });
    }
  };

  const handleLogin = async (id: string, password_from_user: string) => {
    const upperId = id.toUpperCase();
    
    try {
      // Fallback: Check for default admin credentials first
      if (upperId === 'AD101' && password_from_user === 'admin123') {
        setEmployeeId(upperId);
        setCurrentView('admin');
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin! (Using default credentials)',
        });
        return;
      }
      
      // First, check admin collection
      const adminSnapshot = await getDocs(collection(firestore, 'admin'));
      console.log('Admin docs count:', adminSnapshot.docs.length);
      
      const adminData = adminSnapshot.docs.find(doc => {
        const data = doc.data();
        console.log('Checking admin doc:', data);
        return data.id === upperId || data.adminId === upperId;
      });
      
      if (adminData) {
        const admin = adminData.data();
        console.log('Admin found:', admin);
        
        // Check admin password
        if (admin.password !== password_from_user) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Incorrect password.',
          });
          return;
        }
        
        // Successful admin login
        setEmployeeId(upperId);
        setCurrentView('admin');
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, Admin!`,
        });
        return;
      }
      
      // If not admin, check employee collection
      const employeeSnapshot = await getDocs(collection(firestore, 'employee'));
      console.log('Employee docs count:', employeeSnapshot.docs.length);
      
      const employeeData = employeeSnapshot.docs.find(doc => {
        const data = doc.data();
        console.log('Checking employee doc:', data);
        return data.workerId === upperId;
      });
      
      if (!employeeData) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Employee ID not found.',
        });
        return;
      }
      
      const employee = employeeData.data() as Worker;
      console.log('Employee found:', employee);
      
      // Check if password matches
      if (employee.password !== password_from_user) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Incorrect password.',
        });
        return;
      }
      
      // Check if employee is active
      if (!employee.isActive) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Your account is inactive. Please contact admin.',
        });
        return;
      }
      
      // Successful worker login
      setEmployeeId(upperId);
      setCurrentView('worker');
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${employee.name}!`,
      });
      
    } catch (error) {
      console.error('Error during login:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An error occurred during login. Please try again.',
      });
    }
  };

  const handleLogout = () => {
    setEmployeeId(null);
    setCurrentView('login');
  };

  const handleUpdateWorker = async (updatedWorker: Partial<Worker>) => {
    if (!updatedWorker.id) return;
    
    try {
      const workerRef = doc(firestore, 'employee', updatedWorker.id);
      await updateDoc(workerRef, updatedWorker);
      setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? { ...w, ...updatedWorker } : w));
      
      toast({
        title: 'Success',
        description: 'Worker updated successfully!',
      });
    } catch (error) {
      console.error('Error updating worker:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update worker.',
      });
    }
  };

  const handleUpdateMenuItem = async (updatedItem: Partial<MenuItem>) => {
    if (!updatedItem.id) return;
    
    try {
      const itemRef = doc(firestore, 'menu', updatedItem.id);
      await updateDoc(itemRef, { ...updatedItem, updatedAt: new Date().toISOString() });
      setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() } : item));
      
      toast({
        title: 'Success',
        description: 'Menu item updated successfully!',
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update menu item.',
      });
    }
  };

  const handleAddMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    // This function is now handled directly by AddDishDialog writing to Firestore
    // We'll refresh the data by re-fetching
    const refreshMenu = async () => {
      const menuSnapshot = await getDocs(collection(firestore, 'menu'));
      const menuData = menuSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setMenuItems(menuData);
    };
    refreshMenu();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      setActiveOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
      
      toast({
        title: 'Success',
        description: 'Order status updated!',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update order status.',
      });
    }
  };
  
  if (!isClient || isLoading) {
    return (
      <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center">
        <p>Loading...</p>
      </main>
    );
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
            onUpdateWorker={handleUpdateWorker}
            onRefreshWorkers={refreshWorkers}
            onRefreshMenuItems={refreshMenuItems}
            employeeId={employeeId || ''}
          />
        );
      case 'worker':
        return (
          <WorkerPortal
            menuItems={menuItemsToShow}
            activeOrders={ordersToShow.filter(o => o.workerId === employeeId)}
            workers={workersToShow}
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
