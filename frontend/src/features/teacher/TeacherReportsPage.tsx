import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherCriteriaDistributionCard from '../../components/teacher/reports/TeacherCriteriaDistributionCard';
import TeacherEngagementStatusCard from '../../components/teacher/reports/TeacherEngagementStatusCard';
import TeacherPerformanceTrendCard from '../../components/teacher/reports/TeacherPerformanceTrendCard';
import TeacherReportsFiltersBar from '../../components/teacher/reports/TeacherReportsFiltersBar';
import TeacherReportsInsights from '../../components/teacher/reports/TeacherReportsInsights';
import TeacherReportsNotice from '../../components/teacher/reports/TeacherReportsNotice';
import TeacherReportsTopBar from '../../components/teacher/reports/TeacherReportsTopBar';
import { useTeacherIdentity } from '../../hooks/useTeacherIdentity';
import { useTeacherReportsData } from '../../hooks/useTeacherReportsData';

export default function TeacherReportsPage() {
  const navigate = useNavigate();
  const { teacherId } = useTeacherIdentity();
  const {
    activeCriterionColor,
    activeCriterionKey,
    activeCriterionLabel,
    availableClasses,
    criteria,
    criteriaColorMap,
    criteriaNav,
    dismissExportNotice,
    engagement,
    error,
    exporting,
    exportNotice,
    generations,
    handleClassChange,
    handleExport,
    handleGenderChange,
    handleGenerationChange,
    loading,
    ratingScale,
    selectedClass,
    selectedGender,
    selectedGeneration,
    setActiveCriterionKey,
    stats,
    trend,
  } = useTeacherReportsData(teacherId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <TeacherMobileNav />
        <TeacherReportsTopBar
          exporting={exporting}
          onExport={handleExport}
          onOpenNotifications={() => navigate('/teacher/notifications')}
        />

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
          <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-8">
            {loading && (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-slate-500">
                  Loading report data...
                </span>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                {error}
              </div>
            )}

            <TeacherReportsNotice
              notice={exportNotice}
              onDismiss={dismissExportNotice}
            />

            {!loading && (
              <>
                <TeacherReportsFiltersBar
                  availableClasses={availableClasses}
                  generations={generations}
                  selectedClass={selectedClass}
                  selectedGender={selectedGender}
                  selectedGeneration={selectedGeneration}
                  stats={stats}
                  onClassChange={handleClassChange}
                  onGenderChange={handleGenderChange}
                  onGenerationChange={handleGenerationChange}
                />

                <TeacherPerformanceTrendCard
                  activeCriterionColor={activeCriterionColor}
                  activeCriterionKey={activeCriterionKey}
                  activeCriterionLabel={activeCriterionLabel}
                  criteriaColorMap={criteriaColorMap}
                  criteriaNav={criteriaNav}
                  ratingScale={ratingScale}
                  totalStudents={stats.totalStudents}
                  trend={trend}
                  onCriterionChange={setActiveCriterionKey}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">
                  <TeacherCriteriaDistributionCard criteria={criteria} />
                  <TeacherEngagementStatusCard
                    completionRate={stats.completionRate}
                    engagement={engagement}
                  />
                </div>

                <TeacherReportsInsights
                  avgScore={stats.avgScore}
                  completionRate={stats.completionRate}
                  ratingScale={ratingScale}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
