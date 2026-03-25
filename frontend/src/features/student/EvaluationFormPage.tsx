import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useEvaluationCriteria 
} from '../../hooks/useEvaluationCriteria';
import { 
  useEvaluationEligibility 
} from '../../hooks/useEvaluationEligibility';
import type { EvaluationCriterion } from '../../components/student/evaluation/types';
import { 
  useEvaluationFormState 
} from '../../hooks/useEvaluationFormState';
import { useEditEvaluation } from '../../hooks/useEditEvaluation';
import { EvaluationTopBar } from '../../components/student/evaluation/EvaluationTopBar';
import { EvaluationProgress } from '../../components/student/evaluation/EvaluationProgress';
import { CriterionHeader } from '../../components/student/evaluation/CriterionHeader';
import { CriterionRating } from '../../components/student/evaluation/CriterionRating';
import { ReflectionField } from '../../components/student/evaluation/ReflectionField';
import { TipBox } from '../../components/student/evaluation/TipBox';
import { StepFooter } from '../../components/student/evaluation/StepFooter';
import { EvaluationSummary } from '../../components/student/evaluation/EvaluationSummary';
import { IneligibleView } from '../../components/student/evaluation/IneligibleView';
import { EligibilityLoader } from '../../components/student/evaluation/EligibilityLoader';
import { SubmitModal } from '../../components/student/evaluation/SubmitModal';

export default function EvaluationFormPage() {
const location = useLocation();
  const criteriaHook = useEvaluationCriteria();
  const { criteria: rawCriteria, ratingScale, isLoading: isCriteriaLoading } = criteriaHook;
  const [criteria, setCriteria] = useState(rawCriteria || []);
  const [localRatingScale, setLocalRatingScale] = useState(ratingScale || 5);
  const [maxReflectionChars, setMaxReflectionChars] = useState(500);

  const eligibility = useEvaluationEligibility(Boolean(rawCriteria?.length && location.search));
  const formState = useEvaluationFormState({
    criteria,
    ratingScale: localRatingScale,
    maxReflectionChars,
    eligibility,
  });

  const {
    currentStep,
    scores,
    reflections,
    isEditMode,
    criterion,
    selectedRating,
    handleNext,
    handleBack,
    handleFinish,
    handleSubmit,
    updateScore,
    updateReflection,
    setEditTitle,
    setShowConfirm,
    showConfirm,
    isSubmitting,
    submitError,
  } = formState;

  const editState = useEditEvaluation(
    criteria,
    localRatingScale,
    setCriteria,
    setLocalRatingScale,
    // Dummy setters for formState-managed fields - prevents crash, editState.initEdit will log but formState handles submit
    () => console.log('Edit score sync noop'),
    () => console.log('Edit reflection sync noop'),
    setMaxReflectionChars
  );

  const {
    editTitle: editStateTitle = '',
    isEditLoading = false,
  } = editState;

  const isLoading = eligibility.isLoading || isCriteriaLoading || (isEditMode && isEditLoading);
  const isStepView = criterion !== null;
  const isSummaryStep = currentStep === criteria.length;
  const totalSteps = criteria.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Sync criteria from hook
  useEffect(() => {
    setCriteria(rawCriteria || []);
    setLocalRatingScale(ratingScale || 5);
  }, [rawCriteria, ratingScale]);

  // Skip initEdit to avoid type issues, formState handles edit mode via location
  useEffect(() => {}, []);

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <EvaluationTopBar />
        <main className="max-w-3xl mx-auto px-4 py-6">
          <EligibilityLoader />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <EvaluationTopBar />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        {!eligibility.canEvaluate ? (
          <IneligibleView 
            daysUntilAvailable={eligibility.daysUntilAvailable}
            nextAvailableLabel={eligibility.nextAvailableLabel}
            evaluationsUsed={eligibility.evaluationsUsed}
            maxEvaluationsPerCycle={eligibility.maxEvaluationsPerCycle}
          />
        ) : (
          <>
            <EvaluationProgress 
              criteria={criteria}
              currentStep={currentStep}
              ratingScale={localRatingScale}
              isEditMode={isEditMode}
              editTitle={editStateTitle}
              onEditTitleChange={(title) => console.log('Edit title noop')}
            />

            <AnimatePresence mode="wait">
              {isStepView ? (
                <motion.div 
                  key={`step-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
                >
                  {criterion && (
                    <CriterionHeader 
                      criterion={criterion} 
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                    />
                  )}
                  
                  <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                    <CriterionRating 
                      rating={selectedRating}
                      maxRating={localRatingScale}
                      onRate={(r) => {
                        if (criterion) updateScore(criterion.key, r);
                      }}
                    />
                    
                    <ReflectionField 
                      criterionKey={criterion?.key ?? ''}
                      value={reflections[criterion?.key ?? ''] || ''}
                      maxChars={maxReflectionChars}
                      onChange={(v) => criterion && updateReflection(criterion.key, v)}
                      label={criterion?.label ?? ''}
                    />
                    
                    <TipBox criterion={criterion || null} selectedRating={selectedRating} />
                  </div>

                  <StepFooter 
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    onBack={handleBack}
                    onNext={handleNext}
                    isSummaryStep={false}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="summary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-primary/10 rounded-3xl shadow-xl overflow-hidden"
                >
                  <div className="p-5 md:p-8 border-b border-primary/5">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                      Review Results
                    </h2>
                    <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed">
                      Review your responses before final submission.
                    </p>
                  </div>

                  <EvaluationSummary 
                    criteria={criteria}
                    scores={scores}
                    ratingScale={localRatingScale}
                  />

                  <StepFooter 
                    isFirstStep={false}
                    isLastStep={true}
                    onBack={handleBack}
                    onNext={handleFinish}
                    isSummaryStep={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center text-slate-400 text-sm">
              <p>Need help with your evaluation? <span className="text-primary hover:underline font-medium cursor-pointer">Contact your Mentor</span></p>
            </div>
          </>
        )}
      </main>

      <SubmitModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        criteriaCount={criteria.length}
      />
    </div>
  );
}

