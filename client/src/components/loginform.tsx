import React, { useState } from 'react';
import { toast } from 'sonner';
import { loginUser } from '../services/authfunctions';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginUser(password); // Ensure loginUser is typed to return the correct response
      if (response && response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
        onLoginSuccess();
        toast.success('Login successful!');
      } else {
        toast.error('Failed to login');
      }
    } catch (error: unknown) {
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      data-testid="login-view"
    >
      <h1 className="text-3xl font-semibold">RSS Feed Reader</h1>
      <p className="mt-4 text-lg">Please log in to use the app.</p>
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2"
      />
      <button className="mt-4" disabled={loading} onClick={handleLogin}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </div>
  );
};

export default Login;
