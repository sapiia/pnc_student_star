import { ClipboardList, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import {
  extractClassName,
  extractGeneration,
  getGenderLabel,
  normalizeGender,
} from '../../../../lib/teacher/utils';
import type { ApiUser } from '../../../../lib/teacher/types';

type StudentProfileSummaryCardProps = {
  student: ApiUser;
  studentName: string;
  avatarUrl: string;
  studentIdDisplay: string;
  showEvaluationList: boolean;
  onMessageStudent: () => void;
  onToggleEvaluationList: () => void;
};

export default function StudentProfileSummaryCard({
  student,
  studentName,
  avatarUrl,
  studentIdDisplay,
  showEvaluationList,
  onMessageStudent,
  onToggleEvaluationList,
}: StudentProfileSummaryCardProps) {
  const generationLabel = extractGeneration(student);
  const classLabel = extractClassName(student);
  const genderLabel = getGenderLabel(normalizeGender(student.gender));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-start gap-8 md:flex-row">
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 size-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white shadow-lg">
        <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 flex-1 mt-2">
        <h2 className="mb-2 text-3xl font-black text-slate-900">{studentName}</h2>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
            {classLabel}
          </span>
          <span className="rounded-lg border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            {generationLabel}
          </span>
          <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {genderLabel}
          </span>
          <span className="text-xs font-bold tracking-wider text-slate-400">ID: {studentIdDisplay}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onMessageStudent}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <MessageSquare className="w-4 h-4" />
            Message Student
          </button>

          <button
            type="button"
            onClick={onToggleEvaluationList}
            className="flex items-center gap-2 rounded-xl border-2 border-primary bg-white px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
          >
            <ClipboardList className="w-4 h-4" />
            {showEvaluationList ? 'Hide Evaluation List' : 'Evaluation List'}
            {showEvaluationList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
