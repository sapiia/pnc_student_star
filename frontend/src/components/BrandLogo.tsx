import logo from '../assets/logo.png';
import { cn } from '../lib/utils';

interface PNLogoMarkProps {
  className?: string;
}

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  title?: string;
  subtitle?: string;
}

export function PNLogoMark({ className }: PNLogoMarkProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100',
        className
      )}
    >
      <img src={logo} alt="PNC Logo" className="w-full h-full object-contain p-1" />
    </div>
  );
}

export default function BrandLogo({
  className,
  markClassName,
  titleClassName,
  subtitleClassName,
  title = 'PNC Student Star',
  subtitle,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <PNLogoMark className={cn('size-10 shrink-0', markClassName)} />
      <div className="min-w-0">
        <div className={cn('truncate text-sm font-black leading-tight text-slate-900', titleClassName)}>{title}</div>
        {subtitle ? (
          <p
            className={cn(
              'truncate text-[10px] font-bold uppercase tracking-wider text-slate-500',
              subtitleClassName
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
