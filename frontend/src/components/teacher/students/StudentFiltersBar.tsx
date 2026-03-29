import { ChevronDown } from 'lucide-react';

type StudentFiltersBarProps = {
  selectedGeneration: string;
  selectedClass: string;
  selectedGender: string;
  generationOptions: string[];
  classOptions: string[];
  onGenerationChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onClearFilters: () => void;
};

export default function StudentFiltersBar({
  selectedGeneration,
  selectedClass,
  selectedGender,
  generationOptions,
  classOptions,
  onGenerationChange,
  onClassChange,
  onGenderChange,
  onClearFilters,
}: StudentFiltersBarProps) {
  return (
    <div className="flex flex-row flex-wrap items-center gap-4">
      <div className="relative">
        <select
          value={selectedGeneration}
          onChange={(e) => onGenerationChange(e.target.value)}
          className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
        >
          {generationOptions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
          className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
        >
          {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select
          value={selectedGender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="All Gender">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      <button onClick={onClearFilters} className="text-sm font-bold text-primary hover:underline xl:ml-auto">Clear all filters</button>
    </div>
  );
}
