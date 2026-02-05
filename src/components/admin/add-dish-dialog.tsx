"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle } from "lucide-react";
import type { MenuItem, Tag } from "@/types";
import MenuItemCard from "@/components/shared/menu-item-card";
import { Textarea } from "@/components/ui/textarea";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

interface AddDishDialogProps {
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
}

const initialDishState: Partial<MenuItem> = {
  name: "",
  price: 0,
  category: "",
  description: "",
  imageUrl: "",
  tags: ["Veg"],
  quantity: 10,
};

export function AddDishDialog({ onAddMenuItem }: AddDishDialogProps) {
  const [newDish, setNewDish] = useState<Partial<MenuItem>>(initialDishState);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewDish((prev) => ({ ...prev, [id]: id === 'price' || id === 'quantity' ? parseFloat(value) || 0 : value }));
  };

  const handleTagChange = (value: string) => {
    setNewDish((prev) => ({ ...prev, tags: [value as Tag] }));
  };
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const dishToAdd = {
        name: newDish.name || 'Unnamed Dish',
        price: newDish.price || 0,
        category: newDish.category || 'Uncategorized',
        description: newDish.description || '',
        imageUrl: newDish.imageUrl || `https://picsum.photos/seed/${Date.now()}/600/400`,
        tags: newDish.tags || ['Veg'],
        quantity: newDish.quantity ?? 10,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add to Firestore 'menu' collection
      await addDoc(collection(firestore, 'menu'), dishToAdd);
      
      toast({
        title: 'Success',
        description: 'Dish added successfully!',
      });
      
      setNewDish(initialDishState);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding dish:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add dish. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormValid = newDish.name && newDish.price && newDish.category;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Dish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to your menu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newDish.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" type="number" value={newDish.price} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Input id="category" value={newDish.category} onChange={handleInputChange} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" value={newDish.description} onChange={handleInputChange} className="col-span-3" placeholder="A short description of the dish." />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" value={newDish.imageUrl} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" value={newDish.quantity} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tag</Label>
              <RadioGroup defaultValue="Veg" onValueChange={handleTagChange} className="col-span-3 flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Veg" id="r1" />
                  <Label htmlFor="r1">Veg</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Non-Veg" id="r2" />
                  <Label htmlFor="r2">Non-Veg</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Dish'}
            </Button>
          </DialogFooter>
        </div>
        <div className="flex flex-col items-center justify-center bg-secondary/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Live Preview</h3>
            <MenuItemCard item={newDish} className="shadow-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
