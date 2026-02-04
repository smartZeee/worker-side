"use client";

import { useState, useEffect } from 'react';
import type { MenuItem, Order } from '@/types';
import { mockMenuItems, mockActiveOrders } from '@/lib/mock-data';
import LoginScreen from '@/components/screens/login-screen';
import AdminPortal from '@/components/screens/admin-portal';
import WorkerPortal from '@/components/screens/worker-portal';

type View = 'login' | 'admin' | 'worker';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setMenuItems(mockMenuItems);
    setActiveOrders(mockActiveOrders);
  }, []);

  const handleLogin = (id: string) => {
    const upperId = id.toUpperCase();
    if (upperId.startsWith('AD')) {
      setEmployeeId(id);
      setCurrentView('admin');
    } else if (upperId.startsWith('WK')) {
      setEmployeeId(id);
      setCurrentView('worker');
    } else {
      // Maybe show an error toast
      console.error('Invalid Employee ID');
    }
  };

  const handleLogout = () => {
    setEmployeeId(null);
    setCurrentView('login');
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(prevItems => 
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems(prevItems => [newItem, ...prevItems]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setActiveOrders(prevOrders =>
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return (
          <AdminPortal
            menuItems={menuItems}
            activeOrders={activeOrders}
            onLogout={handleLogout}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddMenuItem={handleAddMenuItem}
            employeeId={employeeId || ''}
          />
        );
      case 'worker':
        return (
          <WorkerPortal
            menuItems={menuItems}
            activeOrders={activeOrders}
            onLogout={handleLogout}
            onUpdateMenuItem={handleUpdateMenuItem}
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
