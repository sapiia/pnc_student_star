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
        'flex items-center justify-center overflow-hidden rounded-[28%] bg-[#070304] shadow-lg shadow-slate-900/20',
        className
      )}
    >
      <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true">
        <circle cx="48" cy="48" r="47" fill="#070304" />
        <g opacity="0.42">
          <text x="22" y="57" fill="#7B7B82" fontSize="42" fontWeight="900" fontFamily="Arial, sans-serif">
            P
          </text>
          <text x="47" y="57" fill="#7B7B82" fontSize="42" fontWeight="900" fontFamily="Arial, sans-serif">
            N
          </text>
          <rect x="31" y="66" width="36" height="8" fill="#7B7B82" />
          <rect x="26" y="77" width="42" height="8" fill="#7B7B82" />
        </g>
        <text x="19" y="54" fill="#F5F5F5" fontSize="42" fontWeight="900" fontFamily="Arial, sans-serif">
          P
        </text>
        <text x="44" y="54" fill="#F5F5F5" fontSize="42" fontWeight="900" fontFamily="Arial, sans-serif">
          N
        </text>
        <rect x="28" y="62" width="38" height="8" fill="#2EB9EA" />
        <rect x="23" y="73" width="44" height="8" fill="#2EB9EA" />
      </svg>
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
