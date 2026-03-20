import { AlertCircle } from 'lucide-react';
import StudentCard from '../StudentCard';
import type { StudentData } from './useAttentionStudents';

interface StudentGridProps {
  isLoading: boolean;
  students: StudentData[];
}

const LoadingSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 min-h-48 border border-slate-100 shadow-sm animate-pulse" />
    ))}
  </>
);

const EmptyState = () => (
  <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
    <div className="size-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-1">No Students Found</h3>
    <p className="text-sm text-slate-500">There are no students requiring attention matching your search.</p>
  </div>
);

export default function StudentGrid({ isLoading, students }: StudentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {isLoading ? (
        <LoadingSkeleton />
      ) : students.length === 0 ? (
        <EmptyState />
      ) : (
        students.map((student, idx) => (
          <StudentCard
            key={student.id}
            id={student.id}
            name={student.name}
            avatar={student.avatar}
            studentId={student.studentId}
            generation={student.generation}
            className={student.className}
            gender={student.gender}
            rating={student.rating}
            status={student.status}
            lastEval={student.lastEval}
            index={idx}
          />
        ))
      )}
    </div>
  );
}