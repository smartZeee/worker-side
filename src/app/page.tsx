
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem, Order, Worker } from '@/types';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';
import { mockMenuItems, mockActiveOrders, mockWorkers } from '@/lib/mock-data';

type View = 'login' | 'admin' | 'worker';

export default function Home() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>('login');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Use mock data
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [activeOrders, setActiveOrders] = useState<Order[]>(mockActiveOrders);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (id: string, password_from_user: string) => {
    const upperId = id.toUpperCase();
    
    // Hardcoded credentials check
    if (upperId === 'AD101' && password_from_user === 'pass123') {
      setCurrentView('admin');
      setEmployeeId(upperId);
    } else if (upperId === 'WK001' && password_from_user === 'pass123') {
      setCurrentView('worker');
      setEmployeeId(upperId);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect Employee ID or password.',
      });
    }
  };

  const handleLogout = () => {
    setEmployeeId(null);
    setCurrentView('login');
  };

  const handleAddWorker = (newWorker: Omit<Worker, 'id'>) => {
    const workerToAdd: Worker = {
      ...newWorker,
      id: newWorker.workerId, // Use workerId as id
    };
    setWorkers(prev => [...prev, workerToAdd]);
    toast({
      title: "Worker Added",
      description: `${newWorker.name} has been added.`,
    });
  };

  const handleUpdateWorker = (updatedWorker: Partial<Worker>) => {
    if (!updatedWorker.id) return;
    setWorkers(prev => prev.map(w => w.id === updatedWorker.id ? { ...w, ...updatedWorker } : w));
  };

  const handleUpdateMenuItem = (updatedItem: Partial<MenuItem>) => {
    if (!updatedItem.id) return;
    setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() } : item));
  };

  const handleAddMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const itemToAdd: MenuItem = {
      ...newItem,
      id: (Math.random() * 10000).toString(), // simple id generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMenuItems(prev => [...prev, itemToAdd]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setActiveOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
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
            activeOrders={ordersToShow.filter(o => o.workerId === employeeId)}
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
