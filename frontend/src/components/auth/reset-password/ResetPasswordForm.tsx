import AuthPasswordField from '../AuthPasswordField';
import AuthStatusMessage from '../AuthStatusMessage';

type ResetPasswordFormProps = {
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  submitting: boolean;
  error: string;
  success: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: () => void;
};

export default function ResetPasswordForm({
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  submitting,
  error,
  success,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit
}: ResetPasswordFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Resetting Password For
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-700">{email}</p>
      </div>

      <AuthPasswordField
        id="newPassword"
        label="New Password"
        placeholder="At least 6 characters"
        value={password}
        isVisible={showPassword}
        onChange={onPasswordChange}
        onToggleVisibility={onTogglePassword}
      />

      <AuthPasswordField
        id="confirmNewPassword"
        label="Confirm New Password"
        placeholder="Re-enter new password"
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
        {submitting ? 'Updating Password...' : 'Update Password'}
      </button>
    </form>
  );
}
