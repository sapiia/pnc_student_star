import { Send, Star, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import RadarChart from '../../ui/RadarChart';
import { cn } from '../../../lib/utils';
import {
  CRITERIA_COLOR_STYLES,
  RADAR_COLORS,
  formatShortDate,
  getIcon,
} from '../../../lib/teacher/utils';
import type { ConversationMessage, CriterionDetail, FeedbackRecord, StudentRecord } from '../../../lib/teacher/types';

type StudentPerformancePanelProps = {
  isOpen: boolean;
  selectedStudent: StudentRecord | null;
  radarData: { data: Array<{ subject: string; score: number }>; maxValue: number };
  selectedCriteria: Array<{
    criterion_key: string;
    criterion_name?: string;
    criterion_icon?: string | null;
    star_value: number;
    reflection?: string;
    tip_snapshot?: string;
  }>;
  globalRatingScale: number;
  conversationMessages: ConversationMessage[];
  replyToMessage: ConversationMessage | null;
  feedbackDraft: string;
  teacherMaxFeedbackCharacters: number;
  latestTeacherFeedback: FeedbackRecord | null;
  feedbackError: string;
  feedbackSuccess: string;
  isSubmittingFeedback: boolean;
  canSubmitFeedback: boolean;
  isDeletingFeedbackId: number | null;
  isMarkingReplyReadId: number | null;
  onClose: () => void;
  onSelectCriterion: (criterion: CriterionDetail) => void;
  onReplyToMessage: (message: ConversationMessage) => void;
  onCancelReply: () => void;
  onHideFeedback: (feedbackId: number) => void;
  onDeleteFeedback: (feedbackId: number) => void;
  onMarkReplyRead: (notificationId: number) => void;
  onDraftChange: (value: string) => void;
  onSubmitFeedback: () => void;
};

export default function StudentPerformancePanel({
  isOpen,
  selectedStudent,
  radarData,
  selectedCriteria,
  globalRatingScale,
  conversationMessages,
  replyToMessage,
  feedbackDraft,
  teacherMaxFeedbackCharacters,
  latestTeacherFeedback,
  feedbackError,
  feedbackSuccess,
  isSubmittingFeedback,
  canSubmitFeedback,
  isDeletingFeedbackId,
  isMarkingReplyReadId,
  onClose,
  onSelectCriterion,
  onReplyToMessage,
  onCancelReply,
  onHideFeedback,
  onDeleteFeedback,
  onMarkReplyRead,
  onDraftChange,
  onSubmitFeedback,
}: StudentPerformancePanelProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden shrink-0 sticky top-0 h-fit max-h-[calc(100vh-160px)]"
        >
          <div className="p-6 border-b border-slate-50 shrink-0 relative bg-white z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Performance Overview</h3>
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                <img src={selectedStudent?.avatar} alt={selectedStudent?.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{selectedStudent?.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{selectedStudent?.studentId} | {selectedStudent?.className}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
            <div className="h-64 flex items-center justify-center shrink-0 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner p-4 relative overflow-hidden">
              {selectedStudent && radarData.data.length > 0 ? (
                <RadarChart data={radarData.data} dataKeys={RADAR_COLORS} maxValue={radarData.maxValue} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 text-center px-6">No evaluation data is available for this student yet.</div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Criteria Breakdown</h4>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Click a criterion for details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedCriteria.length > 0 ? selectedCriteria.map((response, criterionIndex) => {
                  const style = CRITERIA_COLOR_STYLES[criterionIndex % CRITERIA_COLOR_STYLES.length];
                  return (
                    <button
                      key={response.criterion_key}
                      type="button"
                      onClick={() => onSelectCriterion({
                        key: response.criterion_key,
                        label: String(response.criterion_name || response.criterion_key),
                        icon: String(response.criterion_icon || 'Star'),
                        score: Number(response.star_value || 0),
                        reflection: String(response.reflection || '').trim(),
                        tip: String(response.tip_snapshot || '').trim(),
                      })}
                      className={cn('p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left hover:bg-white transition-all', style.hover)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={cn('size-10 rounded-2xl flex items-center justify-center', style.iconBg, style.iconText)}>{getIcon(response.criterion_icon)}</div>
                        <span className={cn('text-[10px] font-black uppercase tracking-widest', style.detailText)}>Details</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{response.criterion_name || response.criterion_key}</p>
                      <div className={cn('flex', style.stars)}>
                        {Array.from({ length: globalRatingScale }).map((_, index) => (
                          <Star key={`${response.criterion_key}-${index}`} className={cn('w-3 h-3 fill-current', index >= Math.floor(Number(response.star_value || 0)) && 'text-slate-200 fill-slate-200')} />
                        ))}
                      </div>
                    </button>
                  );
                }) : Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">No Data</p>
                    <div className="flex text-slate-200">{Array.from({ length: 5 }).map((__, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-bold text-slate-900">Teacher&apos;s Qualitative Feedback Chat</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{conversationMessages.length} messages</span>
              </div>
              <div className="max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                {conversationMessages.length > 0 ? conversationMessages.map((message) => (
                  <div key={message.id} className={cn('flex', message.source === 'teacher' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[85%] rounded-2xl border px-3 py-2', message.source === 'teacher' ? 'bg-primary text-white border-primary/40' : 'bg-white text-slate-700 border-slate-200')}>
                      <p className={cn('text-[10px] font-black uppercase tracking-widest', message.source === 'teacher' ? 'text-white/80' : 'text-slate-400')}>
                        {message.source === 'teacher' ? 'Teacher' : 'Student'} • {formatShortDate(message.createdAt)}
                        {message.source === 'student' && ` • ${message.isRead ? 'Read' : 'Unread'}`}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onReplyToMessage(message)}
                          className={cn(
                            'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors',
                            message.source === 'teacher'
                              ? 'border border-white/30 bg-white/15 text-white hover:bg-white/25'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100',
                          )}
                        >
                          Reply
                        </button>
                        {message.source === 'teacher' && message.feedbackId && (
                          <>
                            <button
                              type="button"
                              onClick={() => onHideFeedback(Number(message.feedbackId))}
                              className="rounded-lg border border-white/30 bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/25 transition-colors"
                            >
                              Hide
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteFeedback(Number(message.feedbackId))}
                              disabled={isDeletingFeedbackId === Number(message.feedbackId)}
                              className="rounded-lg border border-white/30 bg-rose-500/85 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white hover:bg-rose-500 transition-colors disabled:opacity-60 inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              {isDeletingFeedbackId === Number(message.feedbackId) ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
                        )}
                        {message.source === 'student' && !message.isRead && message.notificationId && (
                          <button
                            type="button"
                            onClick={() => onMarkReplyRead(Number(message.notificationId))}
                            disabled={isMarkingReplyReadId === Number(message.notificationId)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
                          >
                            {isMarkingReplyReadId === Number(message.notificationId) ? 'Saving...' : 'Mark Read'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-400">No messages yet. Write the first feedback below.</div>
                )}
              </div>

              {replyToMessage && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-bold text-primary">Replying to {replyToMessage.source === 'student' ? 'student' : 'teacher'}: "{replyToMessage.text.slice(0, 120)}"</p>
                    <button type="button" onClick={onCancelReply} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <span className={cn('text-[10px] font-black uppercase tracking-widest', feedbackDraft.length > teacherMaxFeedbackCharacters ? 'text-rose-600' : 'text-slate-400')}>
                  {feedbackDraft.length}/{teacherMaxFeedbackCharacters}
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Write your message..."
                maxLength={teacherMaxFeedbackCharacters}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                value={feedbackDraft}
                onChange={(e) => onDraftChange(e.target.value)}
              />
              {latestTeacherFeedback && (
                <p className="text-[11px] font-bold text-slate-400">Your latest sent message was posted on {formatShortDate(latestTeacherFeedback.created_at)}.</p>
              )}
              {feedbackError && <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{feedbackError}</div>}
              {feedbackSuccess && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{feedbackSuccess}</div>}
            </div>

            <button
              onClick={onSubmitFeedback}
              disabled={!canSubmitFeedback}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              {isSubmittingFeedback ? 'Sending Message...' : 'Send Message'}
            </button>
            <p className="text-center text-[10px] text-slate-400">
              {selectedStudent?.latestEvaluation?.submitted_at ? `Latest evaluation submitted on ${formatShortDate(selectedStudent.latestEvaluation.submitted_at)}` : 'No submitted evaluation yet'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
