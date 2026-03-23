type AuthStatusMessageProps = {
  tone: 'error' | 'success';
  message: string;
  compact?: boolean;
};

const toneClasses = {
  error: 'border-rose-100 bg-rose-50 text-rose-700',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700'
};

export default function AuthStatusMessage({
  tone,
  message,
  compact = false
}: AuthStatusMessageProps) {
  return (
    <div
      className={`rounded-lg border text-sm font-semibold ${toneClasses[tone]} ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {message}
    </div>
  );
}
