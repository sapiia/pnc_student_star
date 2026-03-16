import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatScore } from '../../../lib/teacher/utils';
import type { StudentRecord } from '../../../lib/teacher/types';

type StudentTableProps = {
  students: StudentRecord[];
  filteredStudents: StudentRecord[];
  selectedStudentId: number | null;
  unreadReplyCountByStudent: Record<number, number>;
  isLoading: boolean;
  loadError: string;
  onOpenOverview: (studentId: number) => void;
  onViewProfile: (studentId: number) => void;
  onMessageStudent: (studentId: number) => void;
};

export default function StudentTable({
  students,
  filteredStudents,
  selectedStudentId,
  unreadReplyCountByStudent,
  isLoading,
  loadError,
  onOpenOverview,
  onViewProfile,
  onMessageStudent,
}: StudentTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
            <th className="px-6 py-4">Student ID</th>
            <th className="px-6 py-4">Full Name</th>
            <th className="px-6 py-4">Gender</th>
            <th className="px-6 py-4">Avg Score</th>
            <th className="px-6 py-4">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {isLoading ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Loading students...</td></tr>
          ) : loadError ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-rose-600 font-medium">{loadError}</td></tr>
          ) : filteredStudents.map((student) => (
            <tr
              key={student.id}
              className={cn('group transition-all cursor-pointer', selectedStudentId === student.id ? 'bg-primary/5' : 'hover:bg-slate-50/50')}
              onClick={() => onOpenOverview(student.id)}
            >
              <td className="px-6 py-5 text-sm font-medium text-slate-500">{student.studentId}</td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{student.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.generation} | {student.className}</span>
                    {(unreadReplyCountByStudent[student.id] || 0) > 0 && (
                      <span className="mt-1 inline-flex w-fit items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                        {unreadReplyCountByStudent[student.id]} new {(unreadReplyCountByStudent[student.id] || 0) > 1 ? 'replies' : 'reply'}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg',
                    student.gender === 'male'
                      ? 'bg-sky-50 text-sky-600'
                      : student.gender === 'female'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {student.gender}
                </span>
              </td>
              <td className="px-6 py-5">
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-lg',
                    student.averageScore === null
                      ? 'bg-slate-100 text-slate-500'
                      : student.averageScore >= 4
                        ? 'bg-emerald-50 text-emerald-600'
                        : student.averageScore >= 3
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600',
                  )}
                >
                  {formatScore(student.averageScore, student.ratingScale)}
                </span>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOverview(student.id);
                    }}
                    className={cn(
                      'text-xs font-bold transition-colors px-3 py-1 rounded-lg border border-slate-200',
                      selectedStudentId === student.id
                        ? 'text-primary bg-primary/5 border-primary/30'
                        : 'text-slate-500 hover:text-primary hover:border-primary/30',
                    )}
                  >
                    View Overview
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(student.id);
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessageStudent(student.id);
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-lg border border-primary/40 text-primary hover:bg-primary/5 transition-colors flex items-center gap-1"
                  >
                    Message
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && !loadError && filteredStudents.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No students found matching the selected filters.</td></tr>
          )}
        </tbody>
      </table>
      <div className="p-4 border-t border-slate-50 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">Showing {filteredStudents.length} of {students.length} students</p>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg" disabled><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1.5 bg-primary text-white rounded-lg" disabled><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
