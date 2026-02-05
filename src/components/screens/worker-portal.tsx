import type { MenuItem, Order, Worker } from '@/types';
import PortalHeader from '@/components/shared/header';
import OrderGrid from '@/components/worker/order-grid';
import QuickStockControl from '@/components/worker/quick-stock-control';
import EmployeeTable from '@/components/worker/employee-table';

interface WorkerPortalProps {
  menuItems: MenuItem[];
  activeOrders: Order[];
  workers: Worker[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  employeeId: string;
}

export default function WorkerPortal({
  menuItems,
  activeOrders,
  workers,
  onLogout,
  onUpdateOrderStatus,
  employeeId,
}: WorkerPortalProps) {
  const nonCompletedOrders = activeOrders.filter(order => order.status !== 'Completed');

  return (
    <div className="w-full min-h-screen flex flex-col">
      <PortalHeader portalName="Kitchen Display" employeeId={employeeId} onLogout={onLogout} />
      <main className="flex-1 w-full p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <OrderGrid
              orders={nonCompletedOrders}
              menuItems={menuItems}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          </div>
          <div className="lg:col-span-1">
            <QuickStockControl menuItems={menuItems} />
          </div>
        </div>
        <div className="w-full">
          <EmployeeTable workers={workers} />
        </div>
      </main>
    </div>
  );
}
