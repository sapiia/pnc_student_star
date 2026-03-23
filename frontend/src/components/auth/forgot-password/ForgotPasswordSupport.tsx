import { ArrowLeft, ShieldCheck } from 'lucide-react';

type ForgotPasswordSupportProps = {
  onBackToLogin: () => void;
};

export default function ForgotPasswordSupport({
  onBackToLogin
}: ForgotPasswordSupportProps) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 border-t border-slate-100 pt-6">
      <button
        type="button"
        onClick={onBackToLogin}
        className="group flex items-center gap-2 text-sm font-semibold text-primary decoration-2 underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Login
      </button>

      <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <ShieldCheck className="h-4 w-4" />
        Secure Recovery
      </div>
    </div>
  );
}
