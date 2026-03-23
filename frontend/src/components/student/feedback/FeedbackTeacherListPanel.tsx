import { Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDateLabel } from './utils';
import type { TeacherSummary } from './types';

type Props = {
  teachers: TeacherSummary[];
  selectedTeacherId: number | null;
  isLoading: boolean;
  canViewTeacherFeedback: boolean;
  loadError: string;
  isMobileChatOpen: boolean;
  onSelectTeacher: (teacherId: number) => void;
};

export function FeedbackTeacherListPanel({
  teachers,
  selectedTeacherId,
  isLoading,
  canViewTeacherFeedback,
  loadError,
  isMobileChatOpen,
  onSelectTeacher,
}: Props) {
  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col border-r border-slate-200 bg-white pb-24 transition-all duration-300 md:w-96 md:translate-x-0 md:pb-0',
        isMobileChatOpen
          ? '-translate-x-full hidden md:flex md:translate-x-0'
          : 'translate-x-0',
      )}
    >
      <div className="border-b border-slate-50 p-6">
        <h2 className="text-xl font-bold text-slate-900">Teachers</h2>
        <p className="mt-1 text-xs text-slate-500">{teachers.length} profiles</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-sm font-medium text-slate-500">
            Loading feedback...
          </div>
        ) : !canViewTeacherFeedback ? (
          <div className="p-6 text-sm font-medium text-slate-500">
            Teacher feedback is currently hidden by admin settings.
          </div>
        ) : loadError ? (
          <div className="p-6 text-sm font-medium text-rose-600">
            {loadError}
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-6 text-sm font-medium text-slate-500">
            No teacher feedback yet.
          </div>
        ) : (
          teachers.map((teacher) => (
            <button
              key={teacher.teacherId}
              onClick={() => onSelectTeacher(teacher.teacherId)}
              className={cn(
                'group relative flex w-full gap-4 border-b border-slate-50 p-6 text-left transition-all hover:bg-slate-50',
                selectedTeacherId === teacher.teacherId && 'bg-slate-50',
              )}
            >
              {selectedTeacherId === teacher.teacherId ? (
                <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary" />
              ) : null}

              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                {teacher.teacherProfileImage ? (
                  <img
                    src={teacher.teacherProfileImage}
                    alt={teacher.teacherName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-4">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {teacher.teacherName}
                  </p>

                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      {formatDateLabel(teacher.latestAt)}
                    </span>
                    {teacher.unreadCount > 0 ? (
                      <span className="mt-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                        {teacher.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {teacher.totalFeedbacks} feedback
                  {teacher.totalFeedbacks > 1 ? 's' : ''}
                </p>

                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {teacher.latestSnippet || 'No content'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
