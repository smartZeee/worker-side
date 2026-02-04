import type { MenuItem, Order } from '@/types';
import PortalHeader from '@/components/shared/header';
import DashboardStats from '@/components/admin/dashboard-stats';
import MenuList from '@/components/admin/menu-list';

interface AdminPortalProps {
  menuItems: MenuItem[];
  activeOrders: Order[];
  onLogout: () => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: MenuItem) => void;
  employeeId: string;
}

export default function AdminPortal({
  menuItems,
  activeOrders,
  onLogout,
  onUpdateMenuItem,
  onAddMenuItem,
  employeeId,
}: AdminPortalProps) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <PortalHeader portalName="Admin Portal" employeeId={employeeId} onLogout={onLogout} />
      <main className="flex-1 w-full container mx-auto p-4 md:p-6 lg:p-8">
        <div className="space-y-8">
          <h2 className="text-3xl font-headline">Dashboard</h2>
          <DashboardStats menuItems={menuItems} activeOrders={activeOrders} />
          <MenuList 
            menuItems={menuItems} 
            onUpdateMenuItem={onUpdateMenuItem}
            onAddMenuItem={onAddMenuItem}
          />
        </div>
      </main>
    </div>
  );
}
