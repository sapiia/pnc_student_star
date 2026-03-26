import { Send } from 'lucide-react';

import type {
  ChatMessage,
  Contact,
} from './adminMessages.types';

interface AdminMessageComposerProps {
  editingTarget: ChatMessage | null;
  error: string;
  isSending: boolean;
  isTyping: boolean;
  messageDraft: string;
  replyTarget: ChatMessage | null;
  selectedContact: Contact;
  onCancelEdit: () => void;
  onCancelReply: () => void;
  onDraftBlur: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}

export default function AdminMessageComposer({
  editingTarget,
  error,
  isSending,
  isTyping,
  messageDraft,
  replyTarget,
  selectedContact,
  onCancelEdit,
  onCancelReply,
  onDraftBlur,
  onDraftChange,
  onSend,
}: AdminMessageComposerProps) {
  return (
    <div className="border-t border-slate-200 bg-white p-4 md:p-8">
      {replyTarget ? (
        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Replying
          </p>
          <p className="truncate text-xs font-bold text-slate-700">{replyTarget.text}</p>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {editingTarget ? (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
            Editing Message
          </p>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700"
          >
            Cancel Edit
          </button>
        </div>
      ) : null}

      <div className="relative">
        <textarea
          value={messageDraft}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={onDraftBlur}
          placeholder={
            editingTarget
              ? 'Edit your message...'
              : `Type your message to ${selectedContact.name}...`
          }
          className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-16 pl-6 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          rows={2}
        />
        {isTyping ? (
          <p className="mt-2 text-[11px] font-bold text-slate-500">
            {selectedContact.name} is typing...
          </p>
        ) : null}
        <button
          onClick={onSend}
          disabled={isSending || !messageDraft.trim()}
          className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
          title={editingTarget ? 'Save edit' : 'Send message'}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

      {error ? <p className="mt-3 text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
