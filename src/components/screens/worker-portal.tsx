import type { MenuItem, Order } from '@/types';
import PortalHeader from '@/components/shared/header';
import OrderGrid from '@/components/worker/order-grid';
import QuickStockControl from '@/components/worker/quick-stock-control';

interface WorkerPortalProps {
  menuItems: MenuItem[];
  activeOrders: Order[];
  onLogout: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  employeeId: string;
}

export default function WorkerPortal({
  menuItems,
  activeOrders,
  onLogout,
  onUpdateOrderStatus,
  employeeId,
}: WorkerPortalProps) {
  const nonCompletedOrders = activeOrders.filter(order => order.status !== 'Completed');

  return (
    <div className="w-full min-h-screen flex flex-col">
      <PortalHeader portalName="Kitchen Display" employeeId={employeeId} onLogout={onLogout} />
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
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
      </main>
    </div>
  );
}
