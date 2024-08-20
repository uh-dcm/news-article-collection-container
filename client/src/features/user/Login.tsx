import React, { useState, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { loginUser } from '@/services/authfunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import ReregisterButton from './reregister-button';

interface LoginProps {
  onLoginSuccess: () => void;
}

interface LoginResponse {
  access_token: string;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response: LoginResponse | null = await loginUser(password);
      if (response && response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        toast.success('Login successful!');
        onLoginSuccess();
      } else {
        toast.error('Failed to login');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Login failed: ' + error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      data-testid="login-view"
    >
      <img
        src="/images/logo.png"
        alt="News Article Collector Logo"
        className="mb-8 h-24 w-24"
      />
      <h1 className="text-3xl font-semibold">News Article Collector</h1>
      <p className="mt-4 text-lg">Please log in to use the app</p>
      <Input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-2 w-64 border-input bg-background text-foreground"
      />
      <Button className="mt-4" disabled={loading} onClick={handleLogin}>
        {loading ? 'Logging in...' : 'Log in'}
      </Button>
      <ReregisterButton />
    </div>
  );
};

export default Login;
