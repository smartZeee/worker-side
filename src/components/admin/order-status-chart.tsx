'use client';

import * as React from 'react';
import { Pie, PieChart, Label, Cell } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Order } from '@/types';

interface OrderStatusChartProps {
  orders: Order[];
}

export default function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const chartData = React.useMemo(() => {
    const completed = orders.filter((order) => order.status === 'Completed').length;
    const active = orders.length - completed;
    return [
      { status: 'active', count: active, fill: 'var(--color-active)' },
      { status: 'completed', count: completed, fill: 'var(--color-completed)' },
    ];
  }, [orders]);

  const chartConfig = {
    count: {
      label: 'Orders',
    },
    active: {
      label: 'Active',
      color: 'hsl(var(--chart-2))',
    },
    completed: {
      label: 'Completed',
      color: 'hsl(var(--chart-1))',
    },
  };

  const totalOrders = React.useMemo(() => {
    return orders.length;
  }, [orders]);
  
  if (totalOrders === 0) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Order Status</CardTitle>
                 <CardDescription>Active vs. Completed Orders</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <p className="text-sm text-muted-foreground">No order data available.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Active vs. Completed Orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="status" />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} className="stroke-background" />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalOrders.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground"
                        >
                          Orders
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
