import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import StudentTableRow from './StudentTableRow';
import type { StudentData } from '../../../hooks/useTeacherDashboardData';

interface StudentTableProps {
  students: StudentData[];
  paginatedStudents: StudentData[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onProfile: (id: number) => void;
  onMessage: (id: number) => void;
  goToPage: (page: number) => void;
}

export default function StudentTable({
  students,
  paginatedStudents,
  currentPage,
  totalPages,
  loading,
  onProfile,
  onMessage,
  goToPage,
}: StudentTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100">
        <h3 className="text-base md:text-lg font-bold text-slate-900">Student Performance List</h3>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Cohort</th>
              <th className="px-6 py-4">Avg Rating</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Evaluation</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
{loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-sm font-bold text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading students data...
                  </div>
                </td>
              </tr>
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-sm font-bold text-slate-400">
                  {students.length === 0 ? 'No students assigned yet. Contact administrator.' : 'No students matching your search criteria.'}
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <StudentTableRow
                  key={student.id}
                  student={student}
                  onProfile={onProfile}
                  onMessage={onMessage}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && students.length > 0 && (
        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-500">
            Showing <span className="text-slate-900 font-bold">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="text-slate-900 font-bold">{Math.min(currentPage * 10, students.length)}</span> of{" "}
            <span className="text-slate-900 font-bold">{students.length}</span> students
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                )
                .map((pageNum, idx, array) => (
                  <div key={pageNum} className="flex items-center gap-1">
                    {idx > 0 && array[idx - 1] !== pageNum - 1 && (
                      <span className="text-slate-300 text-xs px-1">...</span>
                    )}
                    <button
                      onClick={() => goToPage(pageNum)}
                      className={cn(
                        "size-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all",
                        currentPage === pageNum 
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" 
                          : "text-slate-500 hover:bg-white hover:text-primary border border-transparent hover:border-slate-200"
                      )}
                    >
                      {pageNum}
                    </button>
                  </div>
                ))}
            </div>

            <button 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-30 disabled:cursor-not-allowed bg-white text-primary border border-slate-200 shadow-sm hover:bg-primary hover:text-white rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

