import type {
  ChatMessage,
  Contact,
} from './adminMessages.types';
import { cn } from '../../../lib/utils';
import AdminConversationHeader from './AdminConversationHeader';
import AdminConversationMessages from './AdminConversationMessages';
import AdminMessageComposer from './AdminMessageComposer';
import AdminMessagesEmptyState from './AdminMessagesEmptyState';

interface AdminConversationPanelProps {
  adminAvatar: string;
  adminName: string;
  confirmDeleteMessageId: number | null;
  editingTarget: ChatMessage | null;
  error: string;
  isSending: boolean;
  isTyping: boolean;
  messageDraft: string;
  messages: ChatMessage[];
  openedActionMessageId: number | null;
  replyTarget: ChatMessage | null;
  selectedContact: Contact | null;
  onBack: () => void;
  onCancelDelete: () => void;
  onCancelEdit: () => void;
  onCancelReply: () => void;
  onDelete: (message: ChatMessage) => Promise<void> | void;
  onDraftBlur: () => void;
  onDraftChange: (value: string) => void;
  onEdit: (message: ChatMessage) => void;
  onHide: (messageId: number) => void;
  onPromptDelete: (messageId: number) => void;
  onReply: (message: ChatMessage) => void;
  onSend: () => void;
  onToggleActions: (messageId: number) => void;
}

export default function AdminConversationPanel({
  adminAvatar,
  adminName,
  confirmDeleteMessageId,
  editingTarget,
  error,
  isSending,
  isTyping,
  messageDraft,
  messages,
  openedActionMessageId,
  replyTarget,
  selectedContact,
  onBack,
  onCancelDelete,
  onCancelEdit,
  onCancelReply,
  onDelete,
  onDraftBlur,
  onDraftChange,
  onEdit,
  onHide,
  onPromptDelete,
  onReply,
  onSend,
  onToggleActions,
}: AdminConversationPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col overflow-hidden bg-slate-50',
        !selectedContact ? 'hidden md:flex' : 'flex',
      )}
    >
      {selectedContact ? (
        <>
          <AdminConversationHeader contact={selectedContact} onBack={onBack} />
          <AdminConversationMessages
            adminAvatar={adminAvatar}
            adminName={adminName}
            confirmDeleteMessageId={confirmDeleteMessageId}
            isSending={isSending}
            messages={messages}
            openedActionMessageId={openedActionMessageId}
            selectedContact={selectedContact}
            onCancelDelete={onCancelDelete}
            onDelete={onDelete}
            onEdit={onEdit}
            onHide={onHide}
            onPromptDelete={onPromptDelete}
            onReply={onReply}
            onToggleActions={onToggleActions}
          />
          <AdminMessageComposer
            editingTarget={editingTarget}
            error={error}
            isSending={isSending}
            isTyping={isTyping}
            messageDraft={messageDraft}
            replyTarget={replyTarget}
            selectedContact={selectedContact}
            onCancelEdit={onCancelEdit}
            onCancelReply={onCancelReply}
            onDraftBlur={onDraftBlur}
            onDraftChange={onDraftChange}
            onSend={onSend}
          />
        </>
      ) : (
        <div className="h-full p-8">
          <AdminMessagesEmptyState
            title="Select a contact"
            description="Choose a teacher to view and send messages."
          />
        </div>
      )}
    </div>
  );
}
