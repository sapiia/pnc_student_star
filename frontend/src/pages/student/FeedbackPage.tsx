import StudentMobileNav from '../../components/common/StudentMobileNav';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import { FeedbackChatPanel } from '../../components/student/feedback/FeedbackChatPanel';
import { FeedbackDeleteModal } from '../../components/student/feedback/FeedbackDeleteModal';
import { FeedbackTeacherListPanel } from '../../components/student/feedback/FeedbackTeacherListPanel';
import { FeedbackTopBar } from '../../components/student/feedback/FeedbackTopBar';
import { useStudentFeedback } from '../../hooks/useStudentFeedback';

export default function FeedbackPage() {
  const {
    canViewTeacherFeedback,
    chatContainerRef,
    chatEntries,
    deleteTarget,
    filteredTeachers,
    handleBackToTeacherList,
    handleClearReplyTarget,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleHideMessage,
    handleQuickReply,
    handleReplyTarget,
    handleRequestDelete,
    handleSelectTeacher,
    isDeletingMessage,
    isLoading,
    isLoadingReplies,
    isMobileChatOpen,
    isSubmittingReply,
    loadError,
    replyDraft,
    replyStatus,
    replyToMessage,
    searchQuery,
    selectedTeacher,
    selectedTeacherId,
    setReplyDraft,
    setSearchQuery,
  } = useStudentFeedback();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <StudentMobileNav />
        <FeedbackTopBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        <div className="relative flex flex-1 overflow-hidden">
          <FeedbackTeacherListPanel
            teachers={filteredTeachers}
            selectedTeacherId={selectedTeacherId}
            isLoading={isLoading}
            canViewTeacherFeedback={canViewTeacherFeedback}
            loadError={loadError}
            isMobileChatOpen={isMobileChatOpen}
            onSelectTeacher={handleSelectTeacher}
          />

          <FeedbackChatPanel
            selectedTeacher={selectedTeacher}
            chatEntries={chatEntries}
            isLoadingReplies={isLoadingReplies}
            isLoading={isLoading}
            isMobileChatOpen={isMobileChatOpen}
            chatContainerRef={chatContainerRef}
            replyToMessage={replyToMessage}
            replyDraft={replyDraft}
            replyStatus={replyStatus}
            isSubmittingReply={isSubmittingReply}
            onBack={handleBackToTeacherList}
            onReply={handleReplyTarget}
            onHide={handleHideMessage}
            onDelete={handleRequestDelete}
            onReplyDraftChange={setReplyDraft}
            onClearReplyTarget={handleClearReplyTarget}
            onSendReply={handleQuickReply}
          />
        </div>
      </main>

      <FeedbackDeleteModal
        deleteTarget={deleteTarget}
        isDeletingMessage={isDeletingMessage}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
