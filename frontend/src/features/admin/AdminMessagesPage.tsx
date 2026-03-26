import { useNavigate } from 'react-router-dom';

import AdminConversationPanel from '../../components/admin/messages/AdminConversationPanel';
import AdminMessagesHeader from '../../components/admin/messages/AdminMessagesHeader';
import AdminMessagesSidebar from '../../components/admin/messages/AdminMessagesSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';

import { useAdminMessagesPage } from '../../components/admin/messages/useAdminMessagesPage';

export default function AdminMessagesPage() {
  const navigate = useNavigate();
  const {
    adminAvatar,
    adminName,
    cancelDeleteMessage,
    cancelEdit,
    cancelReply,
    confirmDeleteMessageId,
    contacts,
    editingTarget,
    error,
    handleCloseConversation,
    handleDeleteMessage,
    handleDraftChange,
    handleEditMessage,
    handleHideMessage,
    handleReplyMessage,
    handleSelectContact,
    handleSendMessage,
    handleToggleMessageActions,
    isLoading,
    isSelectedContactTyping,
    isSending,
    messageDraft,
    openedActionMessageId,
    promptDeleteMessage,
    replyTarget,
    searchQuery,
    selectedContact,
    selectedContactId,
    setSearchQuery,
    stopTyping,
    unreadTotal,
    visibleMessages,
  } = useAdminMessagesPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <AdminMobileNav />
        <AdminMessagesHeader
          unreadTotal={unreadTotal}
          onOpenDashboard={() => navigate('/admin/dashboard')}
          onOpenSettings={() => navigate('/admin/settings')}
        />

        <div className="flex flex-1 overflow-hidden">
          <AdminMessagesSidebar
            contacts={contacts}
            isConversationOpen={Boolean(selectedContact)}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedContactId={selectedContactId}
            onSearchChange={setSearchQuery}
            onSelectContact={handleSelectContact}
          />

          <AdminConversationPanel
            adminAvatar={adminAvatar}
            adminName={adminName}
            confirmDeleteMessageId={confirmDeleteMessageId}
            editingTarget={editingTarget}
            error={error}
            isSending={isSending}
            isTyping={isSelectedContactTyping}
            messageDraft={messageDraft}
            messages={visibleMessages}
            openedActionMessageId={openedActionMessageId}
            replyTarget={replyTarget}
            selectedContact={selectedContact}
            onBack={handleCloseConversation}
            onCancelDelete={cancelDeleteMessage}
            onCancelEdit={cancelEdit}
            onCancelReply={cancelReply}
            onDelete={handleDeleteMessage}
            onDraftBlur={stopTyping}
            onDraftChange={handleDraftChange}
            onEdit={handleEditMessage}
            onHide={handleHideMessage}
            onPromptDelete={promptDeleteMessage}
            onReply={handleReplyMessage}
            onSend={handleSendMessage}
            onToggleActions={handleToggleMessageActions}
          />
        </div>
      </main>
    </div>
  );
}
