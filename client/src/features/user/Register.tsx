import { AxiosError } from 'axios';
import React, { useState, KeyboardEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { sendMailNotification } from './mail-notification';
import { registerUser } from '@/services/authfunctions';

interface RegisterProps {
  onRegistrationSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegistrationSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const isReregistering = location.state?.isReregistering || false;

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser(email, password, isReregistering);
      if (response && (response.msg === 'User created' || response.msg === 'User updated')) {
        toast.success(isReregistering ? 'Reregistration successful!' : 'Registration successful!');
        onRegistrationSuccess();
      } else {
        toast.error('Failed to register');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Registration failed: ' + error.message);
      } else {
        toast.error('An unknown error occurred');
      }
      // dont execute mail sending if error (probably needs setLoading too here)
      return;
    } finally {
      setLoading(false);
    }

    try {
      const response = await sendMailNotification(email, password);
      if (response.status == 200) {
        toast.success('Mail sent successfully!');
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
      // return this if notification working
      //  toast.error(error.response?.data.message);
      } else {
        toast.error('An unknown error occurred');
      }
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
      <img
        src="/images/logo.png"
        alt="News Article Collector Logo"
        className="mb-8 w-24 h-24"
      />
      <h1 className="text-3xl font-semibold">News Article Collector</h1>
      <p className="mt-4 text-lg">{isReregistering ? 'Please reregister your details' : 'Please register to use the app'}</p>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-2 w-64 border-input bg-background text-foreground"
      />
      <Input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-2 w-64 border-input bg-background text-foreground"
      />
      <Button className="mt-4" disabled={loading} onClick={handleRegister}>
        {loading ? 'Processing...' : (isReregistering ? 'Reregister' : 'Register')}
      </Button>
    </div>
  );
};

export default Register;
