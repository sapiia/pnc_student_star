import { EyeOff, Pencil, Trash2, Users, MessageSquareText } from 'lucide-react';
import {
  DEFAULT_AVATAR,
  formatShortDate,
  resolveAvatarUrl,
} from '../../../../lib/teacher/utils';
import type {
  FeedbackRecord,
  StudentReplyRecord,
} from '../../../../lib/teacher/types';

type StudentEvaluationFeedbackCardProps = {
  evaluationLabel: string;
  evaluationFeedback: FeedbackRecord[];
  evaluationStudentReplies: StudentReplyRecord[];
  hiddenFeedbackIds: number[];
  teacherId: number | null;
  teacherMaxFeedbackCharacters: number;
  feedbackDraft: string;
  feedbackError: string;
  feedbackSuccess: string;
  isSubmittingFeedback: boolean;
  editingFeedbackId: number | null;
  editDraft: string;
  isUpdatingFeedback: boolean;
  latestTeacherFeedback: FeedbackRecord | null;
  onDraftChange: (value: string) => void;
  onEditDraftChange: (value: string) => void;
  onSubmitFeedback: () => void;
  onStartEdit: (feedback: FeedbackRecord) => void;
  onCancelEdit: () => void;
  onSaveEdit: (feedbackId: number) => void;
  onDeleteFeedback: (feedbackId: number) => void;
  onHideFeedback: (feedbackId: number) => void;
};

type EvaluationConversationItem =
  | {
      kind: 'feedback';
      id: number;
      createdAt?: string;
      content: string;
      feedback: FeedbackRecord;
    }
  | {
      kind: 'reply';
      id: number;
      createdAt?: string;
      content: string;
      reply: StudentReplyRecord;
    };

function buildConversationItems(
  evaluationFeedback: FeedbackRecord[],
  evaluationStudentReplies: StudentReplyRecord[],
  hiddenFeedbackIds: number[],
) {
  return [
    ...evaluationFeedback
      .filter((feedback) => !hiddenFeedbackIds.includes(Number(feedback.id)))
      .map<EvaluationConversationItem>((feedback) => ({
        kind: 'feedback',
        id: Number(feedback.id),
        createdAt: feedback.created_at,
        content: String(feedback.comment || ''),
        feedback,
      })),
    ...evaluationStudentReplies.map<EvaluationConversationItem>((reply) => ({
      kind: 'reply',
      id: Number(reply.notificationId),
      createdAt: reply.createdAt,
      content: String(reply.message || ''),
      reply,
    })),
  ].sort(
    (left, right) =>
      new Date(String(left.createdAt || '')).getTime() -
      new Date(String(right.createdAt || '')).getTime(),
  );
}

function FeedbackMessageCard({
  item,
  teacherId,
  teacherMaxFeedbackCharacters,
  editingFeedbackId,
  editDraft,
  isUpdatingFeedback,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteFeedback,
  onHideFeedback,
}: {
  item: Extract<EvaluationConversationItem, { kind: 'feedback' }>;
  teacherId: number | null;
  teacherMaxFeedbackCharacters: number;
  editingFeedbackId: number | null;
  editDraft: string;
  isUpdatingFeedback: boolean;
  onEditDraftChange: (value: string) => void;
  onStartEdit: (feedback: FeedbackRecord) => void;
  onCancelEdit: () => void;
  onSaveEdit: (feedbackId: number) => void;
  onDeleteFeedback: (feedbackId: number) => void;
  onHideFeedback: (feedbackId: number) => void;
}) {
  const isOwnedByTeacher = Number(item.feedback.teacher_id) === teacherId;
  const teacherAvatarUrl = resolveAvatarUrl(item.feedback.teacher_profile_image, DEFAULT_AVATAR);

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="size-8 shrink-0 overflow-hidden rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {item.feedback.teacher_profile_image ? (
          <img
            src={teacherAvatarUrl}
            alt={item.feedback.teacher_name || 'Teacher'}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Users className="w-4 h-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-900">
            {item.feedback.teacher_name || 'Teacher'}
          </p>
          {isOwnedByTeacher && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              You
            </span>
          )}
        </div>

        <p className="text-[10px] text-slate-400">{formatShortDate(item.createdAt)}</p>

        {editingFeedbackId === item.id ? (
          <div className="mt-2 space-y-2">
            <textarea
              rows={3}
              value={editDraft}
              onChange={(event) => onEditDraftChange(event.target.value)}
              disabled={isUpdatingFeedback}
              maxLength={teacherMaxFeedbackCharacters}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {editDraft.length}/{teacherMaxFeedbackCharacters}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={isUpdatingFeedback}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSaveEdit(item.id)}
                  disabled={isUpdatingFeedback || !editDraft.trim()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUpdatingFeedback ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 flex items-start justify-between gap-2">
            <p className="flex-1 whitespace-pre-wrap text-sm text-slate-700">{item.content}</p>

            {isOwnedByTeacher && (
              <div className="mt-1 flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onStartEdit(item.feedback)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
                  title="Edit feedback"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFeedback(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  title="Delete feedback"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onHideFeedback(item.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  title="Hide feedback"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyMessageCard({
  item,
}: {
  item: Extract<EvaluationConversationItem, { kind: 'reply' }>;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
      <div className="size-8 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
        <MessageSquareText className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-emerald-700">Student Reply</p>
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            Reply
          </span>
        </div>
        <p className="text-[10px] text-emerald-500">{formatShortDate(item.createdAt)}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{item.content}</p>
      </div>
    </div>
  );
}

export default function StudentEvaluationFeedbackCard({
  evaluationLabel,
  evaluationFeedback,
  evaluationStudentReplies,
  hiddenFeedbackIds,
  teacherId,
  teacherMaxFeedbackCharacters,
  feedbackDraft,
  feedbackError,
  feedbackSuccess,
  isSubmittingFeedback,
  editingFeedbackId,
  editDraft,
  isUpdatingFeedback,
  latestTeacherFeedback,
  onDraftChange,
  onEditDraftChange,
  onSubmitFeedback,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteFeedback,
  onHideFeedback,
}: StudentEvaluationFeedbackCardProps) {
  const items = buildConversationItems(
    evaluationFeedback,
    evaluationStudentReplies,
    hiddenFeedbackIds,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="text-sm font-bold text-slate-900">{evaluationLabel} Feedback</h4>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {evaluationFeedback.length} feedback | {evaluationStudentReplies.length} replies
        </span>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {items.length > 0 ? (
          items.map((item) =>
            item.kind === 'feedback' ? (
              <div key={`feedback-${item.id}`}>
                <FeedbackMessageCard
                  item={item}
                  teacherId={teacherId}
                  teacherMaxFeedbackCharacters={teacherMaxFeedbackCharacters}
                  editingFeedbackId={editingFeedbackId}
                  editDraft={editDraft}
                  isUpdatingFeedback={isUpdatingFeedback}
                  onEditDraftChange={onEditDraftChange}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={onSaveEdit}
                  onDeleteFeedback={onDeleteFeedback}
                  onHideFeedback={onHideFeedback}
                />
              </div>
            ) : (
              <div key={`reply-${item.id}`}>
                <ReplyMessageCard item={item} />
              </div>
            ),
          )
        ) : (
          <div className="py-6 text-center text-sm text-slate-400">
            No feedback for this evaluation yet
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <textarea
          rows={3}
          placeholder={`Write feedback for ${evaluationLabel.toLowerCase()}...`}
          value={feedbackDraft}
          onChange={(event) => onDraftChange(event.target.value)}
          maxLength={teacherMaxFeedbackCharacters}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {feedbackDraft.length}/{teacherMaxFeedbackCharacters}
          </span>
          <button
            type="button"
            onClick={onSubmitFeedback}
            disabled={isSubmittingFeedback || !feedbackDraft.trim()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmittingFeedback ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>

        {latestTeacherFeedback && (
          <p className="text-[11px] font-bold text-slate-400">
            Your latest feedback was posted on {formatShortDate(latestTeacherFeedback.created_at)}.
          </p>
        )}
        {feedbackError && <p className="text-xs text-rose-600">{feedbackError}</p>}
        {feedbackSuccess && <p className="text-xs text-emerald-600">{feedbackSuccess}</p>}
      </div>
    </section>
  );
}
