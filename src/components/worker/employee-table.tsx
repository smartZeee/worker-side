"use client";

import { useState } from "react";
import type { Worker } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface EmployeeTableProps {
  workers: Worker[];
}

export default function EmployeeTable({ workers }: EmployeeTableProps) {
  const [isVisible, setIsVisible] = useState(false);

  const roleColors: Record<Worker['role'], string> = {
    admin: 'bg-primary/20 text-primary border-primary/30',
    manager: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    kitchen: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    delivery: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center p-4">
        <Button onClick={() => setIsVisible(true)} size="lg">
          <Users className="mr-2 h-5 w-5" /> View Employee List
        </Button>
      </div>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-headline">Employee Directory</CardTitle>
          <Button variant="outline" onClick={() => setIsVisible(false)}>
            Hide
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-96 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="font-medium">{worker.workerId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{worker.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[worker.role] || ''}>
                        {worker.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {worker.phone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={worker.isActive ? "default" : "secondary"}>
                        {worker.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
