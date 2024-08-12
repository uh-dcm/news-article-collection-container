import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { validateReregisterToken } from '@/services/authfunctions';

interface ReregisterValidatorProps {
  onValidationComplete: (isValid: boolean) => void;
}

const AnimatedToast: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const SuccessToast = () => (
  <AnimatedToast>
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-xl">
      <h4 className="font-bold text-xl mb-2">All Set! 🚀</h4>
      <p className="text-lg">Your link has been confirmed.</p>
      <p className="mt-2">Go ahead and register your new details.</p>
    </div>
  </AnimatedToast>
);

const ReregisterValidator: React.FC<ReregisterValidatorProps> = ({ onValidationComplete }) => {
  const { token } = useParams<{ token: string }>();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Invalid reregistration link');
        onValidationComplete(false);
        return;
      }

      try {
        const response = await validateReregisterToken(token);
        if (response.valid) {
          toast.custom(() => <SuccessToast />, {
            duration: 7000,
            position: 'top-center',
          });
          onValidationComplete(true);
        } else {
          toast.error('Invalid or expired token');
          onValidationComplete(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        toast.error('An error occurred when validating the token. Did it expire already?');
        onValidationComplete(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, onValidationComplete]);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="text-xl font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Validating reregistration token...
        </motion.div>
      </div>
    );
  }

  return null;
};

export default ReregisterValidator;
