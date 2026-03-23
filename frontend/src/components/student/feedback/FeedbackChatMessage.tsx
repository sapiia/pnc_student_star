import { Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDateLabel } from './utils';
import type { ChatEntry } from './types';

type Props = {
  entry: ChatEntry;
  onReply: (entry: ChatEntry) => void;
  onHide: (messageId: string) => void;
  onDelete: (entry: ChatEntry) => void;
};

export function FeedbackChatMessage({
  entry,
  onReply,
  onHide,
  onDelete,
}: Props) {
  const isStudentMessage = entry.kind === 'student';

  return (
    <div className={cn('flex', isStudentMessage ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm md:max-w-[78%]',
          isStudentMessage
            ? 'border-primary/30 bg-primary text-white'
            : 'border-slate-200 bg-white text-slate-700',
        )}
      >
        <p
          className={cn(
            'mb-1 text-[10px] font-black uppercase tracking-widest',
            isStudentMessage ? 'text-white/80' : 'text-primary',
          )}
        >
          {isStudentMessage ? 'You replied' : `Feedback from ${entry.quarterLabel}`}
        </p>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.text}</p>

        <p
          className={cn(
            'mt-2 text-[10px] font-bold',
            isStudentMessage ? 'text-white/80' : 'text-slate-400',
          )}
        >
          {formatDateLabel(entry.createdAt)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onReply(entry)}
            className={cn(
              'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
              isStudentMessage
                ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
            )}
          >
            Reply
          </button>

          <button
            type="button"
            onClick={() => onHide(entry.id)}
            className={cn(
              'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
              isStudentMessage
                ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
            )}
          >
            Hide
          </button>

          <button
            type="button"
            onClick={() => onDelete(entry)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
              isStudentMessage
                ? 'border border-white/30 bg-rose-500/85 text-white hover:bg-rose-500'
                : 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
            )}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

