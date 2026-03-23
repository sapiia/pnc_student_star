import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import { useEvaluationHistory } from '../../hooks/useEvaluationHistory';
import { HistoryTopBar } from '../../components/student/evaluation/history/HistoryTopBar';
import { HistoryPageHeader } from '../../components/student/evaluation/history/HistoryPageHeader';
import { PerformanceTrend } from '../../components/student/evaluation/history/PerformanceTrend';
import { HistoryList } from '../../components/student/evaluation/history/HistoryList';
import { QuickSummary } from '../../components/student/evaluation/history/QuickSummary';
import { CycleSettings } from '../../components/student/evaluation/history/CycleSettings';

const initialFilters = {
  searchQuery: '',
  sortBy: 'recent' as const
};

export default function EvaluationHistoryPage() {
  const {
    historyItems,
    filteredHistoryItems,
    trendData,
    activeTrendData,
    isLoading,
    studentName,
    studentId,
    cycleDays,
    globalRatingScale,
    globalCriteria,
    activeCriterionId,
    canEditAfterSubmit,
    criteriaNav,
    maxFeedbackCount,
    highestRating,
    nextDueLabel,
    latestEvaluation,
    onSearchChange,
    onSortChange,
    onCriterionChange,
    onEditEvaluation,
    onViewReport,
  } = useEvaluationHistory(initialFilters);

  const recordCount = historyItems.length;
  const latestRating = latestEvaluation?.rating || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StudentMobileNav />
        <HistoryTopBar 
          searchQuery={initialFilters.searchQuery}
          onSearchChange={onSearchChange}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <HistoryPageHeader 
              studentName={studentName}
              studentId={studentId}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <PerformanceTrend 
                  activeTrendData={activeTrendData}
                  globalRatingScale={globalRatingScale}
                  maxFeedbackCount={maxFeedbackCount}
                  activeCriterionId={activeCriterionId}
                  criteriaNav={criteriaNav}
                  onCriterionChange={onCriterionChange}
                  latestRating={latestRating}
                  recordCount={recordCount}
                />
                
                <HistoryList 
                  filteredHistoryItems={filteredHistoryItems}
                  sortBy={initialFilters.sortBy}
                  onSortChange={onSortChange}
                  isLoading={isLoading}
                  canEdit={canEditAfterSubmit}
                />
              </div>

              <div className="space-y-8">
                <QuickSummary 
                  totalEvaluations={recordCount}
                  highestRating={highestRating}
                  nextDueLabel={nextDueLabel}
                />
                
                <CycleSettings cycleDays={cycleDays} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
