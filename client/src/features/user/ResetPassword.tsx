import React, { useState, KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { resetUserPassword } from '@/services/authfunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResetPasswordProps {
  onResetSuccess: () => void;
}

interface ResetResponse {
  msg: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onResetSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handlePasswordReset = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      // the token for resetUserPassword is in the URL like so: /reset-password?token=123456
      // we can extract it from the URL and pass it to reset
      const token = new URLSearchParams(location.search).get('token');
      if (token === null) {
        toast.error('Invalid reset token, try resending the reset email');
        return;
      }
      const response: ResetResponse | null = await resetUserPassword(
        password,
        token
      );
      if (response && response.msg === 'Password reset successful') {
        toast.success(response.msg);
        onResetSuccess();
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error('Reset failed: ' + error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handlePasswordReset();
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">Reset Your Password</h1>
      <Input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-4 w-64 border-input bg-background text-foreground"
      />
      <Input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mt-4 w-64 border-input bg-background text-foreground"
      />
      <Button className="mt-6" disabled={loading} onClick={handlePasswordReset}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </div>
  );
};

export default ResetPassword;
