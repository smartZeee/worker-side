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
import { Badge } from "@/components/ui/badge";
import type { Worker } from "@/types";
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

interface EditWorkerDialogProps {
  worker: Worker;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function EditWorkerDialog({ worker, isOpen, onClose, onRefresh }: EditWorkerDialogProps) {
  const [isActive, setIsActive] = useState(worker.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { firestore } = initializeFirebase();

  const roleColors: Record<Worker['role'], string> = {
    admin: 'bg-primary/20 text-primary border-primary/30',
    manager: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    kitchen: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    delivery: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  const handleToggleStatus = async () => {
    setIsSubmitting(true);
    try {
      const workerRef = doc(firestore, 'employee', worker.id);
      await updateDoc(workerRef, { isActive: !isActive });
      
      setIsActive(!isActive);
      toast({
        title: 'Success',
        description: `Worker ${!isActive ? 'activated' : 'deactivated'} successfully!`,
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating worker status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update worker status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const workerRef = doc(firestore, 'employee', worker.id);
      await deleteDoc(workerRef);
      
      toast({
        title: 'Success',
        description: 'Worker deleted successfully!',
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error deleting worker:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete worker.',
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
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Manage the status of {worker.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">{worker.name}</p>
                <p className="text-sm text-muted-foreground">{worker.workerId}</p>
              </div>
              <Badge variant="outline" className={roleColors[worker.role]}>
                {worker.role}
              </Badge>
            </div>
            {worker.phone && (
              <div className="p-4 border rounded-lg">
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <p className="text-base">{worker.phone}</p>
              </div>
            )}
            <div className="p-4 border rounded-lg">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <p className="text-base font-mono">{'•'.repeat(worker.password?.length || 8)}</p>
              <p className="text-xs text-muted-foreground mt-1">Stored securely</p>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="status" className="text-base">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "Active employee" : "Inactive employee"}
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
              Delete Worker
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
              This will permanently delete "{worker.name}" ({worker.workerId}) from your employee records. This action cannot be undone.
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
