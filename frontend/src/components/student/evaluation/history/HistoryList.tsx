import { ChevronDown, FileText } from 'lucide-react';
import { HistoryCard } from './HistoryCard';

interface Props {
  filteredHistoryItems: Array<{
    id: number;
    title: string;
    period: string;
    completedLabel: string;
    nextDueLabel: string;
    rating: number;
    ratingScale: number;
  }>;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  isLoading: boolean;
  canEdit: boolean;
}

export function HistoryList({ 
  filteredHistoryItems, 
  sortBy, 
  onSortChange, 
  isLoading, 
  canEdit 
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-900">Evaluation List</h3>
        <div className="relative">
          <select
            id="history-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full md:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors outline-none focus:ring-2 focus:ring-primary/20 uppercase tracking-widest"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="title">A to Z</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-sm font-bold text-slate-500">
            Loading evaluation history...
          </div>
        ) : filteredHistoryItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <div className="size-16 mx-auto rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">No evaluation history yet</h4>
            <p className="text-sm text-slate-500">
              After you submit an evaluation, it will appear here with its completed date and next due date.
            </p>
          </div>
        ) : (
          filteredHistoryItems.map((evalItem, idx) => (
            <HistoryCard
              key={evalItem.id}
              item={evalItem}
              canEdit={canEdit}
              index={idx}
            />
          ))
        )}
      </div>
    </div>
  );
}

