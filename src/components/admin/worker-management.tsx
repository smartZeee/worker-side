"use client";

import type { Worker } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface WorkerManagementProps {
  workers: Worker[];
  onUpdateWorker: (worker: Partial<Worker>) => void;
}

export default function WorkerManagement({ workers, onUpdateWorker }: WorkerManagementProps) {

  const handleToggle = (worker: Worker, checked: boolean) => {
    onUpdateWorker({ id: worker.id, isActive: checked });
  };

  const roleColors: Record<Worker['role'], string> = {
    admin: 'bg-primary/20 text-primary border-primary/30',
    manager: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    kitchen: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    delivery: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  }
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-headline">Worker Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
         <ScrollArea className="h-96 px-6">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {workers.map((worker) => (
                <TableRow key={worker.id}>
                    <TableCell>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-muted-foreground">{worker.workerId}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={roleColors[worker.role] || ''}>{worker.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                         <div className="flex items-center justify-end space-x-2">
                            <Label htmlFor={`active-${worker.id}`} className={worker.isActive ? 'text-green-400' : 'text-red-400'}>
                                {worker.isActive ? "Active" : "Inactive"}
                            </Label>
                            <Switch
                                id={`active-${worker.id}`}
                                checked={worker.isActive}
                                onCheckedChange={(checked) => handleToggle(worker, checked)}
                                aria-label={`${worker.name} active status`}
                            />
                        </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
         </ScrollArea>
      </CardContent>
    </Card>
  );
}
