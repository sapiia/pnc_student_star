import type { LucideIcon } from 'lucide-react';

type RegisterTextFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  icon: LucideIcon;
  type?: string;
  readOnly?: boolean;
};

export default function RegisterTextField({
  id,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  readOnly = false
}: RegisterTextFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          required={!readOnly}
          className={`h-12 w-full rounded-lg border border-slate-200 pl-12 pr-4 text-sm outline-none transition-all ${
            readOnly
              ? 'bg-slate-50 text-slate-700'
              : 'bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary'
          }`}
        />
      </div>
    </div>
  );
}
