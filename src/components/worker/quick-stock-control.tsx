import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MenuItem } from "@/types";
import { cn } from "@/lib/utils";

interface QuickStockControlProps {
  menuItems: MenuItem[];
}

export default function QuickStockControl({ menuItems }: QuickStockControlProps) {
  const getQuantityColor = (quantity: number) => {
    if (quantity === 0) return "text-red-500";
    if (quantity > 0 && quantity <= 10) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Live Stock</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-12rem)] p-4">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className={cn("text-sm font-bold", getQuantityColor(item.quantity))}>
                  {item.quantity} in stock
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
