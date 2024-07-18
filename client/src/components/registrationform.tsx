import React, { useState } from 'react';
import { toast } from 'sonner';
import { registerUser } from '../services/authfunctions';

interface RegisterProps {
  onRegistrationSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegistrationSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await registerUser(email, password);
      if (response && response.msg == 'User created') {
        onRegistrationSuccess();
        toast.success('Registration successful!');
      } else {
        toast.error('Failed to register');
      }
    } catch (error: any) {
      toast.error('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      data-testid="register-view"
    >
      <h1 className="text-3xl font-semibold">RSS Feed Reader</h1>
      <p className="mt-4 text-lg">Please register to use the app.</p>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2"
      />
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2"
      />
      <button className="mt-4" disabled={loading} onClick={handleRegister}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  );
};

export default Register;
