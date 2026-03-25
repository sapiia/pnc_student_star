import { useNavigate } from 'react-router-dom';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import { ResultActions } from '../../components/student/evaluation/result/ResultActions';
import { ResultCriterionModal } from '../../components/student/evaluation/result/ResultCriterionModal';
import { ResultCriteriaGrid } from '../../components/student/evaluation/result/ResultCriteriaGrid';
import { ResultFeedbackPanel } from '../../components/student/evaluation/result/ResultFeedbackPanel';
import { ResultHeroCard } from '../../components/student/evaluation/result/ResultHeroCard';
import {
  FocusAreaCard,
  StrongestAreaCard,
} from '../../components/student/evaluation/result/ResultInsightCards';
import { ResultRadarSection } from '../../components/student/evaluation/result/ResultRadarSection';
import { ResultToast } from '../../components/student/evaluation/result/ResultToast';
import { ResultTopBar } from '../../components/student/evaluation/result/ResultTopBar';
import { useEvaluationResult } from '../../hooks/useEvaluationResult';

export default function EvaluationResultPage() {
  const navigate = useNavigate();
  const {
    activeCriterion,
    averageScore,
    closeCriterion,
    completedLabel,
    criteriaData,
    evaluation,
    focusCriterion,
    isLoading,
    openCriterion,
    periodLabel,
    quarterFeedback,
    radarData,
    radarKeys,
    ratingScale,
    strongestCriterion,
    toastMessage,
    dismissToast,
  } = useEvaluationResult();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <StudentMobileNav />
        <ResultTopBar onDashboard={() => navigate('/dashboard')} />
        <ResultToast message={toastMessage} onClose={dismissToast} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:gap-8">
            <ResultHeroCard
              period={evaluation?.period ? periodLabel : ''}
              completedLabel={completedLabel}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-7">
                <ResultRadarSection
                  criteriaData={criteriaData}
                  radarData={radarData}
                  radarKeys={radarKeys}
                  ratingScale={ratingScale}
                  averageScore={averageScore}
                  completedLabel={completedLabel}
                  isLoading={isLoading}
                />
              </div>

              <div className="flex flex-col gap-6 lg:col-span-5">
                <StrongestAreaCard
                  criterion={strongestCriterion}
                  ratingScale={ratingScale}
                />
                <FocusAreaCard
                  criterion={focusCriterion}
                  ratingScale={ratingScale}
                />
                <ResultFeedbackPanel
                  feedbacks={quarterFeedback}
                  period={periodLabel}
                  onViewAll={() => navigate('/feedback')}
                />
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 md:text-2xl">
                    Detail View
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 md:text-sm">
                    Click cards for full reflections.
                  </p>
                </div>
              </div>

              <ResultCriteriaGrid
                criteriaData={criteriaData}
                ratingScale={ratingScale}
                onSelectCriterion={openCriterion}
              />
            </section>

            <ResultActions
              onDashboard={() => navigate('/dashboard')}
              onHistory={() => navigate('/history')}
            />
          </div>
        </div>
      </main>

      <ResultCriterionModal
        criterion={activeCriterion}
        ratingScale={ratingScale}
        onClose={closeCriterion}
      />
    </div>
  );
}
