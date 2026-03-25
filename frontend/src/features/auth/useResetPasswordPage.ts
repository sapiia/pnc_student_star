import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

type UseResetPasswordPageOptions = {
  token: string;
  onSuccessRedirect: () => void;
};

export default function useResetPasswordPage({
  token,
  onSuccessRedirect
}: UseResetPasswordPageOptions) {
  const [email, setEmail] = useState('');
  const [loadingToken, setLoadingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirectTimerRef = useRef(null as number | null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Missing reset token. Please open the reset link from your email.');
        setLoadingToken(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/password-reset/validate?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid or expired reset link.');
          return;
        }

        setEmail(String(data.email || '').trim());
      } catch (_error) {
        setError('Failed to validate reset link.');
      } finally {
        setLoadingToken(false);
      }
    };

    void validateToken();
  }, [token]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Missing reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to reset password.');
        return;
      }

      setSuccess(data.message || 'Password reset successfully. Redirecting...');
      redirectTimerRef.current = window.setTimeout(() => onSuccessRedirect(), 1200);
    } catch (_error) {
      setError('Unable to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    loadingToken,
    error,
    success,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility: () => setShowPassword((current) => !current),
    toggleConfirmPasswordVisibility: () =>
      setShowConfirmPassword((current) => !current),
    handleSubmit
  };
}
