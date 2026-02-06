import Image from "next/image";
import type { MenuItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AddDishDialog } from "./add-dish-dialog";
import { EditDishDialog } from "./edit-dish-dialog";
import { useState } from "react";

interface MenuListProps {
  menuItems: MenuItem[];
  onUpdateMenuItem: (item: Partial<MenuItem>) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onRefresh?: () => void;
}

export default function MenuList({ menuItems, onUpdateMenuItem, onAddMenuItem, onRefresh }: MenuListProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  
  const handleToggle = (item: MenuItem, checked: boolean) => {
    onUpdateMenuItem({ id: item.id, quantity: checked ? 10 : 0 });
  };

  const handleMenuItemAdded = (item: Omit<MenuItem, 'id'>) => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-headline">Menu Management</CardTitle>
            <AddDishDialog onAddMenuItem={handleMenuItemAdded}/>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
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
                  <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
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
        {selectedItem && (
          <EditDishDialog
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={handleCloseDialog}
            onRefresh={onRefresh || (() => {})}
          />
        )}
      </CardContent>
    </Card>
  );
}
