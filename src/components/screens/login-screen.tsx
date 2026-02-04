"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/logo';

interface LoginScreenProps {
  onLogin: (id: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [employeeId, setEmployeeId] = useState('');

  const handleLoginClick = () => {
    if (employeeId) {
      onLogin(employeeId);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLoginClick();
    }
  };

  return (
    <Card className="w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Logo className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-headline text-primary">CulinaryFlow</h1>
        </div>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your Employee ID to access your portal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee-id">Employee ID</Label>
          <Input
            id="employee-id"
            placeholder="e.g., AD123 or WK001"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            autoFocus
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button onClick={handleLoginClick} className="w-full" disabled={!employeeId}>
          Login
        </Button>
        <p className="text-xs text-muted-foreground">
          Try '<strong>AD123</strong>' for Admin or '<strong>WK001</strong>' for Kitchen Staff.
        </p>
      </CardFooter>
    </Card>
  );
}
