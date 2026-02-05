'use client';

import { useState } from 'react';
import type { Order, MenuItem, OrderStatus } from '@/types';
import OrderCard from './order-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface OrderGridProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

const statusButtonColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  'In Progress': 'bg-blue-500 hover:bg-blue-600 text-white',
  Ready: 'bg-green-500 hover:bg-green-600 text-white',
  Completed: '',
};

const statusBadgeColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Ready: 'bg-green-500/20 text-green-300 border-green-500/30',
  Completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};


export default function OrderGrid({ orders, menuItems, onUpdateOrderStatus }: OrderGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Safely parse order time
  const getOrderTime = (order: Order): Date => {
    try {
      if (order.createdAt && typeof order.createdAt.toDate === 'function') {
        const date = order.createdAt.toDate();
        if (!isNaN(date.getTime())) return date;
      }
      if (order.createdAt instanceof Date && !isNaN(order.createdAt.getTime())) {
        return order.createdAt;
      }
      if (order.timestamp) {
        const date = new Date(order.timestamp);
        if (!isNaN(date.getTime())) return date;
      }
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (!isNaN(date.getTime())) return date;
      }
    } catch (e) {
      console.error('Error parsing order time:', e);
    }
    return new Date();
  };
  
  const sortedOrders = [...orders].sort((a, b) => {
    return getOrderTime(a).getTime() - getOrderTime(b).getTime();
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'Pending': return 'In Progress';
      case 'In Progress': return 'Ready';
      case 'Ready': return 'Completed';
      default: return null;
    }
  };

  const getActionText = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'Start Cooking';
      case 'In Progress': return 'Mark as Ready';
      case 'Ready': return 'Complete Order';
      default: return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-headline">Live Orders</CardTitle>
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedOrders.length > 0 ? (
          viewMode === 'grid' ? (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="w-[120px]">Time</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[150px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => {
                  const actionText = getActionText(order.status);
                  const nextStatus = getNextStatus(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold text-lg">{order.tableNumber}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                          {order.items.map((item, index) => {
                            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                            return (
                              <li key={index}>
                                {item.quantity}x {menuItem?.name || 'Unknown Item'}
                              </li>
                            );
                          })}
                        </ul>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(getOrderTime(order), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeColors[order.status] || ''}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {actionText && nextStatus && (
                          <Button size="sm" onClick={() => onUpdateOrderStatus(order.id, nextStatus)} className={statusButtonColors[order.status]}>
                            {actionText}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No active orders.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
