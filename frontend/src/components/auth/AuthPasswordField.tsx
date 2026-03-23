import { Eye, EyeOff, Lock } from 'lucide-react';

type AuthPasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

export default function AuthPasswordField({
  id,
  label,
  placeholder,
  value,
  isVisible,
  onChange,
  onToggleVisibility
}: AuthPasswordFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
