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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import type { Worker } from "@/types";

interface AddWorkerDialogProps {
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  existingWorkerIds: string[];
}

const initialWorkerState: Omit<Worker, 'id' | 'isActive'> = {
  workerId: "",
  name: "",
  role: "kitchen",
  phone: "",
};

export function AddWorkerDialog({ onAddWorker, existingWorkerIds }: AddWorkerDialogProps) {
  const [newWorker, setNewWorker] = useState(initialWorkerState);
  const [isOpen, setIsOpen] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'workerId') {
      const upperValue = value.toUpperCase();
      if (existingWorkerIds.includes(upperValue)) {
        setIdError("This Worker ID is already in use.");
      } else {
        setIdError(null);
      }
      setNewWorker((prev) => ({ ...prev, [id]: upperValue }));
    } else {
      setNewWorker((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleRoleChange = (value: Worker['role']) => {
    setNewWorker((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = () => {
    if (idError) return;

    const workerToAdd: Omit<Worker, 'id'> = {
      ...newWorker,
      isActive: true,
    };
    onAddWorker(workerToAdd);
    setNewWorker(initialWorkerState);
    setIsOpen(false);
  };

  const isFormValid = newWorker.workerId && newWorker.name && newWorker.role && !idError;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Worker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new worker. The password will be set by the worker on their first login.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workerId" className="text-right">Worker ID</Label>
            <div className="col-span-3">
              <Input id="workerId" value={newWorker.workerId} onChange={handleInputChange} placeholder="e.g. WK101" />
              {idError && <p className="text-xs text-destructive mt-1">{idError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={newWorker.name} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input id="phone" value={newWorker.phone} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <Select onValueChange={handleRoleChange} defaultValue={newWorker.role}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!isFormValid}>Add Worker</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
