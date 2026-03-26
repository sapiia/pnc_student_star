import { CheckCheck, Clock } from 'lucide-react';

import type {
  ChatMessage,
  Contact,
} from './adminMessages.types';
import { formatDateTime } from './adminMessages.utils';
import { cn } from '../../../lib/utils';
import AdminMessagesEmptyState from './AdminMessagesEmptyState';

interface AdminConversationMessagesProps {
  adminAvatar: string;
  adminName: string;
  confirmDeleteMessageId: number | null;
  isSending: boolean;
  messages: ChatMessage[];
  openedActionMessageId: number | null;
  selectedContact: Contact;
  onCancelDelete: () => void;
  onDelete: (message: ChatMessage) => Promise<void> | void;
  onEdit: (message: ChatMessage) => void;
  onHide: (messageId: number) => void;
  onPromptDelete: (messageId: number) => void;
  onReply: (message: ChatMessage) => void;
  onToggleActions: (messageId: number) => void;
}

export default function AdminConversationMessages({
  adminAvatar,
  adminName,
  confirmDeleteMessageId,
  isSending,
  messages,
  openedActionMessageId,
  selectedContact,
  onCancelDelete,
  onDelete,
  onEdit,
  onHide,
  onPromptDelete,
  onReply,
  onToggleActions,
}: AdminConversationMessagesProps) {
  return (
    <div className="custom-scrollbar flex-1 overflow-y-auto space-y-4 p-4 md:space-y-6 md:p-8">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex max-w-2xl gap-4',
              message.isMe ? 'ml-auto flex-row-reverse' : '',
            )}
          >
            <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-slate-200 shadow-sm">
              <img
                src={message.isMe ? adminAvatar : selectedContact.avatar}
                alt={message.isMe ? adminName : selectedContact.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className={cn('space-y-2', message.isMe ? 'text-right' : '')}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onToggleActions(message.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleActions(message.id);
                  }
                }}
                className={cn(
                  'cursor-pointer rounded-2xl border p-5 shadow-sm',
                  message.isMe
                    ? 'rounded-tr-none border-primary bg-primary text-white'
                    : 'rounded-tl-none border-slate-200 bg-white text-slate-700',
                )}
              >
                <p className="whitespace-pre-wrap font-medium leading-relaxed">
                  {message.text}
                </p>
              </div>

              {openedActionMessageId === message.id ? (
                <div
                  className={cn(
                    'flex items-center gap-2',
                    message.isMe ? 'justify-end' : '',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(message)}
                    disabled={!message.isMe}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onHide(message.id)}
                    className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    onClick={() => onPromptDelete(message.id)}
                    className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              ) : null}

              {confirmDeleteMessageId === message.id ? (
                <div
                  className={cn(
                    'rounded-lg border border-rose-100 bg-rose-50 px-3 py-2',
                    message.isMe ? 'text-right' : '',
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                    Delete this message?
                  </p>
                  <div
                    className={cn(
                      'mt-2 flex gap-2',
                      message.isMe ? 'justify-end' : '',
                    )}
                  >
                    <button
                      type="button"
                      onClick={onCancelDelete}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(message)}
                      disabled={isSending}
                      className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {isSending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  'flex items-center gap-2 text-[10px] font-bold text-slate-400',
                  message.isMe ? 'justify-end' : '',
                )}
              >
                {message.isMe ? <CheckCheck className="h-3 w-3 text-primary" /> : null}
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <AdminMessagesEmptyState
          title="No messages yet"
          description={`Start a conversation with ${selectedContact.name} by typing a message below.`}
        />
      )}
    </div>
  );
}
