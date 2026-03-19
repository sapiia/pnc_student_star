import { CheckCheck, Clock, MessageSquare } from 'lucide-react';
import type { RefObject } from 'react';
import { cn } from '../../../lib/utils';
import { formatDateTime } from '../../../lib/teacher/utils';
import type { ChatMessage, Contact } from '../../../lib/teacher/types';

type MessagesListProps = {
  messagesRef: RefObject<HTMLDivElement>;
  visibleMessages: ChatMessage[];
  selectedContact: Contact | null;
  teacherAvatar: string;
  teacherName: string;
  openedActionMessageId: number | null;
  confirmDeleteMessageId: number | null;
  isSending: boolean;
  onToggleActions: (messageId: number) => void;
  onReplyMessage: (message: ChatMessage) => void;
  onEditMessage: (message: ChatMessage) => void;
  onHideMessage: (messageId: number) => void;
  onPromptDelete: (messageId: number) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (message: ChatMessage) => void;
};

export default function MessagesList({
  messagesRef,
  visibleMessages,
  selectedContact,
  teacherAvatar,
  teacherName,
  openedActionMessageId,
  confirmDeleteMessageId,
  isSending,
  onToggleActions,
  onReplyMessage,
  onEditMessage,
  onHideMessage,
  onPromptDelete,
  onCancelDelete,
  onConfirmDelete,
}: MessagesListProps) {
  return (
    <div
      ref={messagesRef}
      className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
      style={{ scrollBehavior: 'smooth' }}
    >
      {visibleMessages.length > 0 ? (
        visibleMessages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-4 max-w-2xl', msg.isMe ? 'ml-auto flex-row-reverse' : '')}>
            <div className="size-10 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-200">
              <img
                src={msg.isMe ? teacherAvatar : selectedContact?.avatar}
                alt={msg.isMe ? teacherName : selectedContact?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={cn('space-y-2', msg.isMe ? 'text-right' : '')}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onToggleActions(msg.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleActions(msg.id);
                  }
                }}
                className={cn(
                  'p-5 rounded-2xl shadow-sm border cursor-pointer',
                  msg.isMe
                    ? 'bg-primary text-white border-primary rounded-tr-none'
                    : 'bg-white text-slate-700 border-slate-200 rounded-tl-none',
                )}
              >
                <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
              </div>
              {openedActionMessageId === msg.id ? (
                <div className={cn('flex items-center gap-2', msg.isMe ? 'justify-end' : '')}>
                  <button
                    type="button"
                    onClick={() => onReplyMessage(msg)}
                    className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditMessage(msg)}
                    disabled={!msg.isMe}
                    className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onHideMessage(msg.id)}
                    className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    onClick={() => onPromptDelete(msg.id)}
                    className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
              {confirmDeleteMessageId === msg.id ? (
                <div className={cn('rounded-lg border border-rose-100 bg-rose-50 px-3 py-2', msg.isMe ? 'text-right' : '')}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Delete this message?</p>
                  <div className={cn('mt-2 flex gap-2', msg.isMe ? 'justify-end' : '')}>
                    <button
                      type="button"
                      onClick={onCancelDelete}
                      className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onConfirmDelete(msg)}
                      disabled={isSending}
                      className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {isSending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className={cn('flex items-center gap-2 text-[10px] font-bold text-slate-400', msg.isMe ? 'justify-end' : '')}>
                {msg.isMe ? <CheckCheck className="w-3 h-3 text-primary" /> : null}
                <Clock className="w-3 h-3" />
                <span>{formatDateTime(msg.createdAt)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No messages yet</h3>
          <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
            Start a conversation with {selectedContact?.name} by typing a message below.
          </p>
        </div>
      )}
    </div>
  );
}
