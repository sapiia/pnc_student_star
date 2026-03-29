import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, User, BarChart2 } from 'lucide-react';
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

const PAGE_SIZE = 10;

export default function StudentTable({
  filteredStudents,
  selectedStudentId,
  unreadReplyCountByStudent,
  isLoading,
  loadError,
  onOpenOverview,
  onViewProfile,
  onMessageStudent,
}: StudentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStudents.length]);

  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const getScoreStyles = (score: number | null) => {
    if (score === null) return 'bg-slate-100 text-slate-500';
    if (score >= 4) return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10';
    if (score >= 3) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10';
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
              <th className="px-6 py-4 font-black">ID</th>
              <th className="px-6 py-4 font-black">Student Details</th>
              <th className="px-6 py-4 font-black">Gender</th>
              <th className="px-6 py-4 font-black">Avg Score</th>
              <th className="px-6 py-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-md w-full" /></td>
                </tr>
              ))
            ) : loadError ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-rose-600 font-semibold">{loadError}</p>
                </td>
              </tr>
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-slate-400 font-medium">No results found</span>
                    <button 
                      onClick={() => setCurrentPage(1)} 
                      className="text-xs text-primary hover:underline"
                    >
                      Clear filters or go back
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => {
                const unreadCount = unreadReplyCountByStudent[student.id] || 0;
                const isSelected = selectedStudentId === student.id;

                return (
                  <tr
                    key={student.id}
                    className={cn(
                      'group transition-colors cursor-pointer',
                      isSelected ? 'bg-primary/[0.03]' : 'hover:bg-slate-50/50'
                    )}
                    onClick={() => onOpenOverview(student.id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-400">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-full overflow-hidden shrink-0 bg-slate-100 ring-2 ring-white shadow-sm">
                          <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {student.generation} • {student.className}
                          </span>
                          {unreadCount > 0 && (
                            <span className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase text-rose-500">
                              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {unreadCount} new {unreadCount === 1 ? 'reply' : 'replies'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md',
                        student.gender === 'male' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-xs font-bold px-2.5 py-1 rounded-lg transition-transform', getScoreStyles(student.averageScore))}>
                        {formatScore(student.averageScore, student.ratingScale)}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenOverview(student.id)}
                          className={cn(
                            "p-2 rounded-lg border transition-all",
                            isSelected ? "border-primary/30 bg-primary/10 text-primary" : "border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30"
                          )}
                          title="Overview"
                        >
                          <BarChart2 className="size-4" />
                        </button>
                        <button
                          onClick={() => onViewProfile(student.id)}
                          className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                          title="Profile"
                        >
                          <User className="size-4" />
                        </button>
                        <button
                          onClick={() => onMessageStudent(student.id)}
                          className="p-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-all"
                          title="Message"
                        >
                          <MessageSquare className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <p className="text-[11px] text-slate-500 font-medium">
          Showing <span className="text-slate-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}</span> of <span className="text-slate-900">{filteredStudents.length}</span> results
        </p>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="p-2 disabled:opacity-30 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="size-4" />
          </button>
          
          <div className="flex items-center px-3 text-xs font-bold text-slate-600">
            {currentPage} <span className="mx-1 text-slate-300">/</span> {totalPages || 1}
          </div>

          <button 
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 disabled:opacity-30 bg-white shadow-sm border border-slate-200 text-primary hover:bg-slate-50 rounded-md transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}