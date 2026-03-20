import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import MessagesHeader from '../../components/teacher/messages/MessagesHeader';
import ContactsPanel from '../../components/teacher/messages/ContactsPanel';
import ChatHeader from '../../components/teacher/messages/ChatHeader';
import MessagesList from '../../components/teacher/messages/MessagesList';
import MessageComposer from '../../components/teacher/messages/MessageComposer';
import EmptyChatState from '../../components/teacher/messages/EmptyChatState';
import { useTeacherMessages } from '../../components/teacher/messages/useTeacherMessages';
import { cn } from '../../lib/utils';

export default function TeacherMessagesPage() {
  const {
    teacherName, teacherAvatar,
    selectedContactId, isMobileChatOpen, messageDraft, searchQuery, roleFilter, showUnreadOnly,
    isLoading, error, isSending, openedActionMessageId, confirmDeleteMessageId, isCompactMode, typingByContactId,
    unreadTotal, filteredContacts, selectedContact, visibleMessages, replyTarget, editingTarget,
    messagesRef,
    setIsMobileChatOpen, setIsCompactMode, setSearchQuery, setRoleFilter, setShowUnreadOnly,
    handleSelectContact, handleDraftChange, handleSendMessage, handleReplyMessage, handleEditMessage, handleHideMessage,
    promptDeleteMessage, handleDeleteMessage, handleToggleActions, handleCancelEdit, stopTyping, cancelReply, cancelDelete,
    navigateToNotifications, navigateToStudentProfile,
  } = useTeacherMessages();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <MessagesHeader
          unreadTotal={unreadTotal}
          onOpenNotifications={navigateToNotifications}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <ContactsPanel
            isMobileChatOpen={isMobileChatOpen}
            isCompactMode={isCompactMode}
            isLoading={isLoading}
            filteredContacts={filteredContacts}
            unreadTotal={unreadTotal}
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            showUnreadOnly={showUnreadOnly}
            selectedContactId={selectedContactId}
            onToggleCompactMode={() => setIsCompactMode((prev) => !prev)}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setRoleFilter}
            onToggleUnreadOnly={() => setShowUnreadOnly((prev) => !prev)}
            onSelectContact={handleSelectContact}
          />
          <div className={cn(
            'flex-1 flex flex-col overflow-hidden bg-slate-50 transition-transform duration-300 md:translate-x-0 pb-20 md:pb-0',
            isMobileChatOpen ? 'translate-x-0 relative' : 'translate-x-full absolute md:relative w-full h-full'
          )}>
            {selectedContact ? (
              <>
                <ChatHeader
                  selectedContact={selectedContact}
                  onBack={() => setIsMobileChatOpen(false)}
                  onOpenStudentProfile={navigateToStudentProfile}
                />
                <MessagesList
                  messagesRef={messagesRef}
                  visibleMessages={visibleMessages}
                  selectedContact={selectedContact}
                  teacherAvatar={teacherAvatar}
                  teacherName={teacherName}
                  openedActionMessageId={openedActionMessageId}
                  confirmDeleteMessageId={confirmDeleteMessageId}
                  isSending={isSending}
                  onToggleActions={handleToggleActions}
                  onReplyMessage={handleReplyMessage}
                  onEditMessage={handleEditMessage}
                  onHideMessage={handleHideMessage}
                  onPromptDelete={promptDeleteMessage}
                  onCancelDelete={cancelDelete}
                  onConfirmDelete={(message) => void handleDeleteMessage(message)}
                />
                <MessageComposer
                  messageDraft={messageDraft}
                  replyTarget={replyTarget}
                  editingTarget={editingTarget}
                  selectedContact={selectedContact}
                  typingByContactId={typingByContactId}
                  isSending={isSending}
                  error={error}
                  onDraftChange={handleDraftChange}
                  onStopTyping={stopTyping}
                  onCancelReply={cancelReply}
                  onCancelEdit={handleCancelEdit}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <EmptyChatState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
