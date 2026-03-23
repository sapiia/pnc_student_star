import { LockKeyhole } from 'lucide-react';

export default function ForgotPasswordIntro() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
        <LockKeyhole className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-slate-900">
        Forgot Password?
      </h1>
      <p className="text-base leading-relaxed text-slate-500">
        Enter the email address associated with your PNC Student Star account, and
        we&apos;ll send you a link to reset your password.
      </p>
    </div>
  );
}
