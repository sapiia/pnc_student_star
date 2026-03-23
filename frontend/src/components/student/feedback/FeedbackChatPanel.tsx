import { ArrowLeft, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { FeedbackChatMessage } from './FeedbackChatMessage';
import { FeedbackReplyComposer } from './FeedbackReplyComposer';
import type { ChatEntry, TeacherSummary } from './types';

type ChatContainerRef = {
  current: HTMLDivElement | null;
};

type Props = {
  selectedTeacher: TeacherSummary | null;
  chatEntries: ChatEntry[];
  isLoadingReplies: boolean;
  isLoading: boolean;
  isMobileChatOpen: boolean;
  chatContainerRef: ChatContainerRef;
  replyToMessage: ChatEntry | null;
  replyDraft: string;
  replyStatus: string;
  isSubmittingReply: boolean;
  onBack: () => void;
  onReply: (entry: ChatEntry) => void;
  onHide: (messageId: string) => void;
  onDelete: (entry: ChatEntry) => void;
  onReplyDraftChange: (value: string) => void;
  onClearReplyTarget: () => void;
  onSendReply: () => void;
};

export function FeedbackChatPanel({
  selectedTeacher,
  chatEntries,
  isLoadingReplies,
  isLoading,
  isMobileChatOpen,
  chatContainerRef,
  replyToMessage,
  replyDraft,
  replyStatus,
  isSubmittingReply,
  onBack,
  onReply,
  onHide,
  onDelete,
  onReplyDraftChange,
  onClearReplyTarget,
  onSendReply,
}: Props) {
  return (
    <section
      className={cn(
        'flex flex-1 flex-col overflow-hidden bg-white pb-24 transition-all duration-300 md:pb-0',
        isMobileChatOpen
          ? 'translate-x-0'
          : 'hidden translate-x-full md:flex md:translate-x-0',
      )}
    >
      {selectedTeacher ? (
        <>
          <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 md:px-8 md:py-6">
            <button
              onClick={onBack}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary md:size-12">
              {selectedTeacher.teacherProfileImage ? (
                <img
                  src={selectedTeacher.teacherProfileImage}
                  alt={selectedTeacher.teacherName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Users className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-black leading-tight text-slate-900 md:text-lg">
                {selectedTeacher.teacherName}
              </h3>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:mt-1 md:text-xs">
                Conversation
              </p>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-6 md:px-8"
          >
            {isLoadingReplies ? (
              <div className="text-sm font-medium text-slate-500">
                Loading conversation...
              </div>
            ) : chatEntries.length > 0 ? (
              chatEntries.map((entry) => (
                <div key={entry.id}>
                  <FeedbackChatMessage
                    entry={entry}
                    onReply={onReply}
                    onHide={onHide}
                    onDelete={onDelete}
                  />
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <Users className="mb-3 h-14 w-14 opacity-20" />
                <p className="text-sm">No conversation yet for this teacher.</p>
              </div>
            )}
          </div>

          <FeedbackReplyComposer
            replyToMessage={replyToMessage}
            replyDraft={replyDraft}
            replyStatus={replyStatus}
            isSubmittingReply={isSubmittingReply}
            isDisabled={!selectedTeacher}
            onReplyDraftChange={onReplyDraftChange}
            onClearReplyTarget={onClearReplyTarget}
            onSend={onSendReply}
          />
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center text-slate-400">
          <Users className="mb-4 h-16 w-16 opacity-20" />
          <p>{isLoading ? 'Loading feedback...' : 'Select a teacher profile to see all feedback.'}</p>
        </div>
      )}
    </section>
  );
}
