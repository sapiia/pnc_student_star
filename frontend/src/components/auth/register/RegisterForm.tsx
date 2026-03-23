import { Mail, User } from 'lucide-react';
import AuthPasswordField from '../AuthPasswordField';
import AuthStatusMessage from '../AuthStatusMessage';
import RegisterInviteDetails from './RegisterInviteDetails';
import RegisterTextField from './RegisterTextField';
import type { InvitePayload } from './types';

type RegisterFormProps = {
  inviteData: InvitePayload;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  submitting: boolean;
  error: string;
  success: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: () => void;
};

export default function RegisterForm({
  inviteData,
  firstName,
  lastName,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  submitting,
  error,
  success,
  onFirstNameChange,
  onLastNameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit
}: RegisterFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <RegisterInviteDetails inviteData={inviteData} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RegisterTextField
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          value={firstName}
          onChange={onFirstNameChange}
          icon={User}
        />
        <RegisterTextField
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          value={lastName}
          onChange={onLastNameChange}
          icon={User}
        />
      </div>

      <RegisterTextField
        id="email"
        label="Email"
        value={inviteData.email || ''}
        icon={Mail}
        type="email"
        readOnly
      />

      <AuthPasswordField
        id="password"
        label="Password"
        placeholder="At least 6 characters"
        value={password}
        isVisible={showPassword}
        onChange={onPasswordChange}
        onToggleVisibility={onTogglePassword}
      />

      <AuthPasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter password"
        value={confirmPassword}
        isVisible={showConfirmPassword}
        onChange={onConfirmPasswordChange}
        onToggleVisibility={onToggleConfirmPassword}
      />

      {error ? <AuthStatusMessage tone="error" message={error} compact /> : null}
      {success ? <AuthStatusMessage tone="success" message={success} compact /> : null}

      <button
        type="submit"
        disabled={submitting}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
