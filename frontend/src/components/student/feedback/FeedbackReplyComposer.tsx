import { Send, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getReplyPreviewLabel } from './utils';
import type { ChatEntry } from './types';

type Props = {
  replyToMessage: ChatEntry | null;
  replyDraft: string;
  replyStatus: string;
  isSubmittingReply: boolean;
  isDisabled: boolean;
  onReplyDraftChange: (value: string) => void;
  onClearReplyTarget: () => void;
  onSend: () => void;
};

export function FeedbackReplyComposer({
  replyToMessage,
  replyDraft,
  replyStatus,
  isSubmittingReply,
  isDisabled,
  onReplyDraftChange,
  onClearReplyTarget,
  onSend,
}: Props) {
  const isErrorStatus =
    replyStatus.toLowerCase().includes('failed') ||
    replyStatus.toLowerCase().includes('no ');

  return (
    <div className="space-y-3 border-t border-slate-200 bg-white p-6">
      {replyToMessage ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-bold text-primary">
              {getReplyPreviewLabel(replyToMessage)}
            </p>

            <button
              type="button"
              onClick={onClearReplyTarget}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <textarea
        rows={3}
        value={replyDraft}
        onChange={(event) => onReplyDraftChange(event.target.value)}
        placeholder="Reply to this teacher..."
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
      />

      <div className="flex items-center justify-between gap-4">
        <p
          className={cn(
            'text-xs font-bold',
            isErrorStatus ? 'text-rose-600' : 'text-emerald-600',
          )}
        >
          {replyStatus || ' '}
        </p>

        <button
          type="button"
          onClick={onSend}
          disabled={isSubmittingReply || isDisabled}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {isSubmittingReply ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

