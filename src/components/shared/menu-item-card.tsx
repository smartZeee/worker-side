import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: Partial<MenuItem>;
  className?: string;
}

const defaultImage = "https://picsum.photos/seed/placeholder/600/400";
const defaultName = "Your Awesome Dish";

export default function MenuItemCard({ item, className }: MenuItemCardProps) {
  const isVeg = item.tags?.includes("Veg");
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={item.imageUrl || defaultImage}
            alt={item.name || defaultName}
            fill
            className="object-cover"
            data-ai-hint="food"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold leading-tight">{item.name || defaultName}</CardTitle>
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{item.category || 'Category'}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">${(item.price || 0).toFixed(2)}</p>
        <Badge variant={item.isAvailable ?? true ? 'secondary' : 'destructive'}>
          {item.isAvailable ?? true ? 'Available' : 'Sold Out'}
        </Badge>
      </CardFooter>
    </Card>
  );
}
