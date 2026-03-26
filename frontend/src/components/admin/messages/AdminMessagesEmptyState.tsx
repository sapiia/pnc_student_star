import { MessageSquare } from 'lucide-react';

interface AdminMessagesEmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export default function AdminMessagesEmptyState({
  title,
  description,
  className,
}: AdminMessagesEmptyStateProps) {
  return (
    <div className={className || 'flex h-full flex-col items-center justify-center text-center'}>
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-300">
        <MessageSquare className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xs font-bold text-slate-500">{description}</p>
    </div>
  );
}
