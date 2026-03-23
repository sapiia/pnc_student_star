import { useEffect, useRef, useState } from 'react';
import type { InvitePayload } from '../../components/auth/register/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const buildSeededNames = (inviteData: InvitePayload) => {
  const firstName = (inviteData.firstName || '').trim();
  const lastName = (inviteData.lastName || '').trim();

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const fullName = (inviteData.name || '').trim();
  if (!fullName) {
    return { firstName: '', lastName: '' };
  }

  const parts = fullName.split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
};

type UseRegisterPageOptions = {
  inviteToken: string;
  onRegistered: (path: string) => void;
};

export default function useRegisterPage({
  inviteToken,
  onRegistered
}: UseRegisterPageOptions) {
  const [inviteData, setInviteData] = useState(null as InvitePayload | null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirectTimerRef = useRef(null as number | null);

  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteToken) {
        setError('Missing invite token. Please open the registration link from your email.');
        setLoadingInvite(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/invite/validate?token=${encodeURIComponent(inviteToken)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid or expired invite link.');
          return;
        }

        setInviteData(data);
      } catch (_error) {
        setError('Failed to validate invite link.');
      } finally {
        setLoadingInvite(false);
      }
    };

    void validateInvite();
  }, [inviteToken]);

  useEffect(() => {
    if (!inviteData) {
      return;
    }

    const seededNames = buildSeededNames(inviteData);
    setFirstName(seededNames.firstName);
    setLastName(seededNames.lastName);
  }, [inviteData]);

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

    if (!inviteData) {
      setError('Invite data is missing.');
      return;
    }

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();

    if (!normalizedFirstName) {
      setError('First name is required.');
      return;
    }

    if (!normalizedLastName) {
      setError('Last name is required.');
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
      const response = await fetch(`${API_BASE_URL}/users/invite/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: inviteToken,
          name: `${normalizedFirstName} ${normalizedLastName}`.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to complete registration.');
        return;
      }

      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      }

      setSuccess('Registration completed. Redirecting...');

      const redirectPath = data.redirectPath || '/dashboard';
      redirectTimerRef.current = window.setTimeout(() => onRegistered(redirectPath), 1200);
    } catch (_error) {
      setError('Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    inviteData,
    loadingInvite,
    error,
    success,
    firstName,
    lastName,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    submitting,
    setFirstName,
    setLastName,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility: () => setShowPassword((current) => !current),
    toggleConfirmPasswordVisibility: () =>
      setShowConfirmPassword((current) => !current),
    handleSubmit
  };
}
