import { Send } from 'lucide-react';
import type { ChatMessage, Contact } from '../../../lib/teacher/types';

type MessageComposerProps = {
  messageDraft: string;
  replyTarget: ChatMessage | null;
  editingTarget: ChatMessage | null;
  selectedContact: Contact | null;
  typingByContactId: Record<number, boolean>;
  isSending: boolean;
  error: string;
  onDraftChange: (value: string) => void;
  onStopTyping: () => void;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onSendMessage: () => void;
};

export default function MessageComposer({
  messageDraft,
  replyTarget,
  editingTarget,
  selectedContact,
  typingByContactId,
  isSending,
  error,
  onDraftChange,
  onStopTyping,
  onCancelReply,
  onCancelEdit,
  onSendMessage,
}: MessageComposerProps) {
  return (
    <div className="p-8 bg-white border-t border-slate-200">
      {replyTarget ? (
        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Replying</p>
          <p className="text-xs font-bold text-slate-700 truncate">{replyTarget.text}</p>
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
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Editing Message</p>
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
          onChange={(e) => onDraftChange(e.target.value)}
          onBlur={onStopTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (messageDraft.trim() && !isSending) {
                onSendMessage();
              }
            }
          }}
          placeholder={editingTarget ? 'Edit your message...' : `Type your message to ${selectedContact?.name}...`}
          className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
          rows={2}
        />
        {selectedContact && typingByContactId[selectedContact.id] ? (
          <p className="mt-2 text-[11px] font-bold text-slate-500">{selectedContact.name} is typing...</p>
        ) : null}
        <button
          onClick={onSendMessage}
          disabled={isSending || !messageDraft.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60"
          title={editingTarget ? 'Save edit' : 'Send message'}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {error ? <p className="mt-3 text-xs font-bold text-rose-600">{error}</p> : null}
    </div>
  );
}
