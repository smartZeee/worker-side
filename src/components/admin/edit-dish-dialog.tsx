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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { MenuItem } from "@/types";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditDishDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditDishDialog({ item, isOpen, onClose, onRefresh }: EditDishDialogProps) {
  const [isActive, setIsActive] = useState(item.quantity > 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const handleToggleStatus = async () => {
    setIsSubmitting(true);
    try {
      const newQuantity = !isActive ? 10 : 0;
      const itemRef = doc(firestore, 'menu', item.id);
      await updateDoc(itemRef, { quantity: newQuantity, updatedAt: new Date().toISOString() });
      
      setIsActive(!isActive);
      toast({
        title: 'Success',
        description: `Dish ${!isActive ? 'activated' : 'deactivated'} successfully!`,
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating dish status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update dish status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const itemRef = doc(firestore, 'menu', item.id);
      await deleteDoc(itemRef);
      
      toast({
        title: 'Success',
        description: 'Dish deleted successfully!',
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete dish.',
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Dish</DialogTitle>
            <DialogDescription>
              Manage the status of {item.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} • {item.category}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="status" className="text-base">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "Available for customers" : "Marked as sold out"}
                </p>
              </div>
              <Switch
                id="status"
                checked={isActive}
                onCheckedChange={handleToggleStatus}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Dish
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{item.name}" from your menu. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
