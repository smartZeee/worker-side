import type { MenuItem, Order, Worker } from '@/types';
import PortalHeader from '@/components/shared/header';
import DashboardStats from '@/components/admin/dashboard-stats';
import MenuList from '@/components/admin/menu-list';
import WorkerManagement from '@/components/admin/worker-management';

interface AdminPortalProps {
  menuItems: MenuItem[];
  workers: Worker[];
  activeOrders: Order[];
  onLogout: () => void;
  onUpdateMenuItem: (item: Partial<MenuItem>) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onUpdateWorker: (worker: Partial<Worker>) => void;
  employeeId: string;
}

export default function AdminPortal({
  menuItems,
  workers,
  activeOrders,
  onLogout,
  onUpdateMenuItem,
  onAddMenuItem,
  onAddWorker,
  onUpdateWorker,
  employeeId,
}: AdminPortalProps) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <PortalHeader portalName="Admin Portal" employeeId={employeeId} onLogout={onLogout} />
      <main className="flex-1 w-full container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          <h2 className="text-3xl font-headline">Dashboard</h2>
          <DashboardStats menuItems={menuItems} workers={workers} activeOrders={activeOrders} />
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <MenuList 
              menuItems={menuItems} 
              onUpdateMenuItem={onUpdateMenuItem}
              onAddMenuItem={onAddMenuItem}
            />
            <WorkerManagement 
              workers={workers}
              onAddWorker={onAddWorker}
              onUpdateWorker={onUpdateWorker}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
