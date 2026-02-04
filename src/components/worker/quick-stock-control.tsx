import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MenuItem } from "@/types";

interface QuickStockControlProps {
  menuItems: MenuItem[];
  onUpdateMenuItem: (item: MenuItem) => void;
}

export default function QuickStockControl({ menuItems, onUpdateMenuItem }: QuickStockControlProps) {

  const handleToggle = (item: MenuItem, checked: boolean) => {
    onUpdateMenuItem({ ...item, isAvailable: checked });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Quick Stock</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-12rem)] p-4">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={(checked) => handleToggle(item, checked)}
                  aria-label={`Toggle ${item.name} availability`}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
