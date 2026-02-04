'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Utensils, ShoppingCart } from "lucide-react";
import type { MenuItem, Order } from "@/types";
import OrderStatusChart from "./order-status-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO } from 'date-fns';

interface DashboardStatsProps {
  menuItems: MenuItem[];
  activeOrders: Order[];
}

type RevenuePeriod = "daily" | "weekly" | "monthly" | "yearly" | "all";

export default function DashboardStats({ menuItems, activeOrders }: DashboardStatsProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("all");

  const completedOrders = activeOrders.filter(order => order.status === 'Completed');

  const filteredCompletedOrders = completedOrders.filter(order => {
    const orderDate = parseISO(order.timestamp);
    switch (revenuePeriod) {
      case 'daily':
        return isToday(orderDate);
      case 'weekly':
        return isThisWeek(orderDate, { weekStartsOn: 1 });
      case 'monthly':
        return isThisMonth(orderDate);
      case 'yearly':
        return isThisYear(orderDate);
      case 'all':
      default:
        return true;
    }
  });

  const totalRevenue = filteredCompletedOrders.reduce((acc, order) => {
    return acc + order.items.reduce((orderTotal, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return orderTotal + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  }, 0);

  const nonCompletedOrders = activeOrders.filter(order => order.status !== 'Completed');

  const periodLabels: Record<RevenuePeriod, string> = {
    daily: "Today's revenue",
    weekly: "This week's revenue",
    monthly: "This month's revenue",
    yearly: "This year's revenue",
    all: "From all completed orders",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={revenuePeriod} onValueChange={(value: RevenuePeriod) => setRevenuePeriod(value)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{periodLabels[revenuePeriod]}</p>
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
        <CardContent className="text-center pt-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted mx-auto">
              <span className="text-5xl font-bold">{menuItems.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Total dishes in the system</p>
        </CardContent>
      </Card>
      <OrderStatusChart orders={activeOrders} />
    </div>
  );
}
