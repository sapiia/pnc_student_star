import { Send, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { formatShortDate } from '../../lib/teacher/utils';
import type { ConversationMessage } from '../../lib/teacher/types';

interface FeedbackChatProps {
  messages: ConversationMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  maxCharacters: number;
  replyToMessage: ConversationMessage | null;
  onReplyToMessage: (message: ConversationMessage | null) => void;
  latestFeedbackDate?: string;
  error?: string;
  success?: string;
}

export default function FeedbackChat({
  messages,
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
  maxCharacters,
  replyToMessage,
  onReplyToMessage,
  latestFeedbackDate,
  error,
  success,
}: FeedbackChatProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-bold text-slate-900">Teacher's Qualitative Feedback Chat</h4>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {messages.length} messages
        </span>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {messages.length > 0 ? (
            messages.map((message) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn('flex', message.source === 'teacher' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl border px-3 py-2',
                    message.source === 'teacher'
                      ? 'bg-primary text-white border-primary/40'
                      : 'bg-white text-slate-700 border-slate-200'
                  )}
                >
                  <p className={cn('text-[10px] font-black uppercase tracking-widest', message.source === 'teacher' ? 'text-white/80' : 'text-slate-400')}>
                    {message.source === 'teacher' ? 'Teacher' : 'Student'} • {formatShortDate(message.createdAt)}
                    {message.source === 'student' ? ` • ${message.isRead ? 'Read' : 'Unread'}` : ''}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onReplyToMessage(message)}
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                        message.source === 'teacher'
                          ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-400 text-center">
              No messages yet. Write the first feedback below.
            </div>
          )}
        </AnimatePresence>
      </div>

      {replyToMessage && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-bold text-primary">
              Replying to {replyToMessage.source === 'student' ? 'student' : 'teacher'}: "{replyToMessage.text.slice(0, 120)}"
            </p>
            <button type="button" onClick={() => onReplyToMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className={cn(
          'text-[10px] font-black uppercase tracking-widest',
          draft.length > maxCharacters ? 'text-rose-600' : 'text-slate-400'
        )}>
          {draft.length}/{maxCharacters}
        </span>
      </div>

      <textarea
        rows={4}
        placeholder="Write your message..."
        maxLength={maxCharacters}
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
      />

      {latestFeedbackDate && (
        <p className="text-[11px] font-bold text-slate-400">
          Your latest sent message was posted on {formatShortDate(latestFeedbackDate)}.
        </p>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isSubmitting || !draft.trim()}
        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send className="w-5 h-5" />
        {isSubmitting ? 'Sending Message...' : 'Send Message'}
      </button>
    </div>
  );
}

