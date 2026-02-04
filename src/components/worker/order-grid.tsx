import type { Order, MenuItem } from '@/types';
import OrderCard from './order-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderGridProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

export default function OrderGrid({ orders, menuItems, onUpdateOrderStatus }: OrderGridProps) {
  const sortedOrders = [...orders].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="text-3xl font-headline">Live Orders</CardTitle>
        </CardHeader>
        <CardContent>
            {sortedOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedOrders.map((order) => (
                    <OrderCard
                    key={order.id}
                    order={order}
                    menuItems={menuItems}
                    onUpdateOrderStatus={onUpdateOrderStatus}
                    />
                ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No active orders.
                </div>
            )}
        </CardContent>
    </Card>
  );
}
