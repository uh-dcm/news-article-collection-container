import React, { useState, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { registerUser } from '../services/authfunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RegisterProps {
  onRegistrationSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegistrationSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser(email, password);
      if (response && response.msg == 'User created') {
        onRegistrationSuccess();
        toast.success('Registration successful!');
      } else {
        toast.error('Failed to register');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Registration failed: ' + error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      data-testid="register-view"
    >
      <h1 className="text-3xl font-semibold">News Article Collector</h1>
      <p className="mt-4 text-lg">Please register to use the app</p>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-2 w-64 bg-background text-foreground border-input"
      />
      <Input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-2 w-64 bg-background text-foreground border-input"
      />
      <Button
        className="mt-4"
        disabled={loading}
        onClick={handleRegister}
      >
        {loading ? 'Registering...' : 'Register'}
      </Button>
    </div>
  );
};

export default Register;
