'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Utensils, ShoppingCart, Users } from "lucide-react";
import type { MenuItem, Order, Worker } from "@/types";
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
  workers: Worker[];
  activeOrders: Order[];
}

type RevenuePeriod = "daily" | "weekly" | "monthly" | "yearly" | "all";

export default function DashboardStats({ menuItems, workers, activeOrders }: DashboardStatsProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("all");

  const completedOrders = activeOrders.filter(order => order.status === 'Completed');

  const filteredCompletedOrders = completedOrders.filter(order => {
    // Handle both new format (createdAt timestamp) and old format (timestamp string)
    if (!order.createdAt && !order.timestamp) return false;
    
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : 
                      order.timestamp ? parseISO(order.timestamp) : new Date();
    
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
    // Use order.total if available, otherwise calculate from items
    if (order.total) {
      return acc + order.total;
    }
    return acc + order.items.reduce((orderTotal, item) => {
      // New format: items have direct price
      if (item.price) {
        return orderTotal + (item.price * item.quantity);
      }
      // Old format: lookup menuItem
      const menuItem = menuItems.find(mi => mi.id === (item as any).menuItemId);
      return orderTotal + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  }, 0);

  const activeDishes = menuItems.filter(item => item.quantity > 0).length;
  const soldOutDishes = menuItems.filter(item => item.quantity === 0).length;
  const activeWorkers = workers.filter(worker => worker.isActive).length;
  const inactiveWorkers = workers.filter(worker => !worker.isActive).length;

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
          <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <span className="text-2xl font-bold">{activeDishes}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">Sold Out</span>
              </div>
              <span className="text-2xl font-bold">{soldOutDishes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Workers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <span className="text-2xl font-bold">{activeWorkers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                <span className="text-sm text-muted-foreground">Inactive</span>
              </div>
              <span className="text-2xl font-bold">{inactiveWorkers}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <OrderStatusChart orders={activeOrders} />
    </div>
  );
}
