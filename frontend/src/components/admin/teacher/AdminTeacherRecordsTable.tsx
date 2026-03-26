import { Eye, Minus, Pencil, Plus, Trash2, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { TeacherRecord } from './adminTeacherRecords.types';

interface AdminTeacherRecordsTableProps {
  teachers: TeacherRecord[];
  selectedTeacherId: number | null;
  isLoading: boolean;
  onSelectTeacher: (teacher: TeacherRecord) => void;
  onEdit: (teacher: TeacherRecord) => void;
  onToggleStatus: (teacher: TeacherRecord) => void;
  onHardDelete: (teacher: TeacherRecord) => void;
}

export default function AdminTeacherRecordsTable({
  teachers,
  selectedTeacherId,
  isLoading,
  onSelectTeacher,
  onEdit,
  onToggleStatus,
  onHardDelete,
}: AdminTeacherRecordsTableProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50">
            <tr className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <th className="px-6 py-4">Teacher</th>
              <th className="hidden px-6 py-4 md:table-cell">Department</th>
              <th className="hidden px-6 py-4 md:table-cell">Specialization</th>
              <th className="hidden px-6 py-4 text-center sm:table-cell">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                  Loading teachers...
                </td>
              </tr>
            ) : null}
            {!isLoading && teachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                  No teachers match your search.
                </td>
              </tr>
            ) : null}
            {!isLoading ? teachers.map((teacher) => {
              const isActive = teacher.status === 'Active';
              return (
                <tr
                  key={teacher.id}
                  onClick={() => onSelectTeacher(teacher)}
                  className={cn(
                    'group cursor-pointer transition-colors hover:bg-slate-50',
                    selectedTeacherId === teacher.id ? 'bg-primary/5' : '',
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                        <img
                          src={teacher.profileImage}
                          alt={teacher.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{teacher.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{teacher.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="text-xs font-bold text-slate-600">{teacher.department}</span>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <span className="text-xs font-bold text-slate-600">{teacher.specialization}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-black tracking-wider uppercase',
                        isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400',
                      )}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTeacher(teacher);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(teacher);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary"
                        title="Edit Teacher"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(teacher);
                        }}
                        className={cn(
                          'rounded-lg p-2 transition-colors',
                          isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50',
                        )}
                        title={isActive ? 'Disable Teacher' : 'Enable Teacher'}
                      >
                        {isActive ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onHardDelete(teacher);
                        }}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        title="Permanent Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : null}
          </tbody>
        </table>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Showing {teachers.length} teachers
        </p>
      </div>
    </div>
  );
}

