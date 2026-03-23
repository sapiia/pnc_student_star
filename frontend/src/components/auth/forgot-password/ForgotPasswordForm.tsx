import { Mail } from 'lucide-react';
import AuthStatusMessage from '../AuthStatusMessage';

type ForgotPasswordFormProps = {
  email: string;
  errorMessage?: string;
  successMessage?: string;
  isSubmitting?: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ForgotPasswordForm({
  email,
  errorMessage = '',
  successMessage = '',
  isSubmitting = false,
  onEmailChange,
  onSubmit
}: ForgotPasswordFormProps) {
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-900" htmlFor="email">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="e.g. name@university.edu"
            className="flex h-14 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {errorMessage ? (
        <AuthStatusMessage tone="error" message={errorMessage} compact />
      ) : null}

      {successMessage ? (
        <AuthStatusMessage tone="success" message={successMessage} compact />
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
        </button>
      </div>
    </form>
  );
}
