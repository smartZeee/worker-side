import Image from "next/image";
import type { MenuItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AddDishDialog } from "./add-dish-dialog";

interface MenuListProps {
  menuItems: MenuItem[];
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: MenuItem) => void;
}

export default function MenuList({ menuItems, onUpdateMenuItem, onAddMenuItem }: MenuListProps) {
  
  const handleToggle = (item: MenuItem, checked: boolean) => {
    onUpdateMenuItem({ ...item, quantity: checked ? 10 : 0 });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-headline">Menu Management</CardTitle>
            <AddDishDialog onAddMenuItem={onAddMenuItem}/>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-4">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover w-16 h-16"
                  data-ai-hint="food"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`available-${item.id}`}
                  checked={item.quantity > 0}
                  onCheckedChange={(checked) => handleToggle(item, checked)}
                  aria-label={`${item.name} availability`}
                />
                <Label htmlFor={`available-${item.id}`}>{item.quantity > 0 ? "Available" : "Sold Out"}</Label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
