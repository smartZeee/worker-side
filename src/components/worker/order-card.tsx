import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Order, MenuItem, OrderStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface OrderCardProps {
  order: Order;
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const statusColors: Record<OrderStatus, string> = {
    Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Ready: 'bg-green-500/20 text-green-300 border-green-500/30',
    Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function OrderCard({ order, menuItems, onUpdateOrderStatus }: OrderCardProps) {

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'Pending': return 'In Progress';
      case 'In Progress': return 'Ready';
      case 'Ready': return 'Completed';
      default: return null;
    }
  };
  
  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      onUpdateOrderStatus(order.id, nextStatus);
    }
  };

  const getActionText = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'Start Cooking';
        case 'In Progress': return 'Mark as Ready';
        case 'Ready': return 'Complete Order';
        default: return null;
    }
  }

  const actionText = getActionText(order.status);
  
  // Safely parse order time from various formats
  const getOrderTime = (): Date => {
    try {
      // Try Firestore timestamp with toDate method
      if (order.createdAt && typeof order.createdAt.toDate === 'function') {
        const date = order.createdAt.toDate();
        if (!isNaN(date.getTime())) return date;
      }
      // Try if createdAt is already a Date object
      if (order.createdAt instanceof Date && !isNaN(order.createdAt.getTime())) {
        return order.createdAt;
      }
      // Try timestamp string
      if (order.timestamp) {
        const date = new Date(order.timestamp);
        if (!isNaN(date.getTime())) return date;
      }
      // Try createdAt as any other value
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (!isNaN(date.getTime())) return date;
      }
    } catch (e) {
      console.error('Error parsing order time:', e);
    }
    // Fallback to current time
    return new Date();
  };
  
  const orderTime = getOrderTime();
  const timeAgo = formatDistanceToNow(orderTime, { addSuffix: true });

  return (
    <Card className={`flex flex-col justify-between shadow-lg transition-all hover:shadow-primary/20 ${statusColors[order.status]}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{order.customerName}</CardTitle>
          <div className="text-xs text-muted-foreground">{timeAgo}</div>
        </div>
        <CardDescription>Order ID: {order.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-2">₹{item.price}</span>
            </div>
            <span className="text-2xl font-bold text-accent-foreground">
              {item.quantity}x
            </span>
          </div>
        ))}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">₹{order.total?.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      {actionText && (
        <CardFooter>
          <Button className="w-full" variant="secondary" onClick={handleStatusUpdate}>
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
