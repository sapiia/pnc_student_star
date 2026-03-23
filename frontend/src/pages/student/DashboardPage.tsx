import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import CriterionDetailModal from '../../components/student/dashboard/CriterionDetailModal';
import CurrentStatusSection from '../../components/student/dashboard/CurrentStatusSection';
import DashboardCountdownCard from '../../components/student/dashboard/DashboardCountdownCard';
import DashboardTopBar from '../../components/student/dashboard/DashboardTopBar';
import DashboardUrgentBanner from '../../components/student/dashboard/DashboardUrgentBanner';
import DashboardWelcomeCard from '../../components/student/dashboard/DashboardWelcomeCard';
import HistoricalGrowthCard from '../../components/student/dashboard/HistoricalGrowthCard';
import RecentFeedbackCard from '../../components/student/dashboard/RecentFeedbackCard';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    activeCriterion,
    canStartEvaluation,
    cardTransition,
    closeCriterion,
    currentPeriodLabel,
    currentStatusCriteria,
    cycleDays,
    daysLeft,
    evaluationsUsed,
    globalRatingScale,
    historicalComparison,
    latestEvaluation,
    listTransition,
    maxEvaluationsPerCycle,
    openCriterion,
    prefersReducedMotion,
    recentFeedback,
    showUrgentNotification,
    studentId,
    studentName,
    unreadNotificationCount,
  } = useStudentDashboard();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <StudentMobileNav />

        <DashboardTopBar
          unreadNotificationCount={unreadNotificationCount}
          onOpenNotifications={() => navigate('/notifications')}
          onOpenHelp={() => navigate('/help')}
        />

        <div className="mx-auto max-w-7xl space-y-6 p-4 pb-24 md:space-y-8 md:p-8 md:pb-8">
          <DashboardUrgentBanner
            show={showUrgentNotification}
            daysLeft={daysLeft}
            transition={listTransition}
            onViewSchedule={() => navigate('/evaluate')}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <DashboardWelcomeCard
              studentName={studentName}
              studentId={studentId}
              currentPeriodLabel={currentPeriodLabel}
              canStartEvaluation={canStartEvaluation}
              daysLeft={daysLeft}
              evaluationsUsed={evaluationsUsed}
              maxEvaluationsPerCycle={maxEvaluationsPerCycle}
              prefersReducedMotion={prefersReducedMotion}
              transition={cardTransition}
              onStartEvaluation={() => {
                if (canStartEvaluation) {
                  navigate('/evaluate');
                }
              }}
            />

            <DashboardCountdownCard
              daysLeft={daysLeft}
              cycleDays={cycleDays}
              evaluationsUsed={evaluationsUsed}
              maxEvaluationsPerCycle={maxEvaluationsPerCycle}
              transition={cardTransition}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <CurrentStatusSection
                criteria={currentStatusCriteria}
                latestEvaluation={latestEvaluation}
                ratingScale={globalRatingScale}
                prefersReducedMotion={prefersReducedMotion}
                transition={listTransition}
                onSelectCriterion={openCriterion}
              />
            </div>

            <div className="space-y-8">
              <HistoricalGrowthCard comparison={historicalComparison} />
              <RecentFeedbackCard
                feedbackItems={recentFeedback}
                onViewAll={() => navigate('/feedback')}
              />
            </div>
          </div>
        </div>

        <Footer />
      </main>

      <CriterionDetailModal
        criterion={activeCriterion}
        ratingScale={globalRatingScale}
        transition={listTransition}
        onClose={closeCriterion}
      />
    </div>
  );
}
