import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Utensils, ShoppingCart } from "lucide-react";
import type { MenuItem, Order } from "@/types";
import OrderStatusChart from "./order-status-chart";

interface DashboardStatsProps {
  menuItems: MenuItem[];
  activeOrders: Order[];
}

export default function DashboardStats({ menuItems, activeOrders }: DashboardStatsProps) {
  const totalRevenue = activeOrders
    .filter(order => order.status === 'Completed')
    .reduce((acc, order) => {
      return acc + order.items.reduce((orderTotal, item) => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        return orderTotal + (menuItem ? menuItem.price * item.quantity : 0);
      }, 0);
    }, 0);

  const nonCompletedOrders = activeOrders.filter(order => order.status !== 'Completed');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From completed orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{nonCompletedOrders.length}</div>
          <p className="text-xs text-muted-foreground">Pending, In Progress, or Ready</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{menuItems.length}</div>
          <p className="text-xs text-muted-foreground">Total dishes in the system</p>
        </CardContent>
      </Card>
      <OrderStatusChart orders={activeOrders} />
    </div>
  );
}
