import { ArrowLeft } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

type AuthPageHeaderProps = {
  prompt: string;
  actionLabel: string;
  onHomeClick: () => void;
  onActionClick: () => void;
  showActionArrow?: boolean;
};

export default function AuthPageHeader({
  prompt,
  actionLabel,
  onHomeClick,
  onActionClick,
  showActionArrow = false
}: AuthPageHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 lg:px-10">
      <button
        type="button"
        onClick={onHomeClick}
        className="cursor-pointer text-left"
        aria-label="Go to home page"
      >
        <BrandLogo
          title="PNC Student Star"
          subtitle="Student Success Platform"
          className="min-w-0"
        />
      </button>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-slate-500 sm:block">{prompt}</span>
        <button
          type="button"
          onClick={onActionClick}
          className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
        >
          {showActionArrow ? <ArrowLeft className="h-4 w-4" /> : null}
          {actionLabel}
        </button>
      </div>
    </header>
  );
}
