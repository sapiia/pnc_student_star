import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function useForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to send reset email.');
        return;
      }

      setSuccess(data.message || 'If an account exists, a reset link has been sent.');
    } catch (_error) {
      setError('Unable to connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    email,
    error,
    success,
    submitting,
    setEmail,
    handleSubmit
  };
}
