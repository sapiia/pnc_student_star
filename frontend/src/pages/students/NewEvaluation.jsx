import React, { useState } from "react";
import { Star, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";

const steps = [
  "Living",
  "Job & Study",
  "Human & Support",
  "Health",
  "Feeling",
  "Behavior",
  "Money",
  "Life Skill",
];

const descriptions = {
  Living:
    "Reflect on your daily living conditions, including your environment and basic needs. This assessment helps us understand your fundamental well-being.",
  "Job & Study": "Assess your professional and academic progress this quarter.",
  "Human & Support": "Evaluate your relationships and support network.",
  Health: "Review your physical and mental well-being.",
  Feeling: "Reflect on your emotional state and mood patterns.",
  Behavior: "Consider your choices, habits, and decision-making.",
  Money: "Review your financial planning and payment habits.",
  "Life Skill": "Track practical skills and personal development progress.",
};

function NewEvaluation({ onComplete = () => {} }) {
  const [activeStep, setActiveStep] = useState(0);
  const [rating, setRating] = useState(3);
  const currentStep = steps[activeStep];

  return (
    <div className="min-h-screen bg-[#f3f5fa] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-x-auto pb-1">
          <div className="grid min-w-[820px] grid-cols-8 gap-3">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isComplete = index < activeStep;

              return (
                <div key={step} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold ${
                      isActive || isComplete
                        ? "bg-[#5b62f6] text-white"
                        : "bg-[#dce3ee] text-[#8090a6]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-center text-[11px] font-semibold leading-4 ${
                      isActive ? "text-[#5b62f6]" : "text-[#97a4b8]"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#e4e8f0] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
          <div className="p-6 md:p-8">
            <span className="inline-flex rounded-full bg-[#eef0ff] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#5b62f6]">
              Step {activeStep + 1} of 8
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#121a2f] md:text-4xl">{currentStep}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#5c6a80]">{descriptions[currentStep]}</p>

            <div className="mt-10">
              <label className="block text-xl font-semibold text-[#2a3548] md:text-2xl">How would you rate yourself?</label>
              <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="rounded p-1" type="button">
                    <Star
                      size={24}
                      fill={rating >= star ? "currentColor" : "none"}
                      className={rating >= star ? "text-[#5b62f6]" : "text-[#b9c4d6]"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-[18px] font-semibold text-[#2a3548]">Self-Reflection & Details</label>
                <span className="text-xs font-medium text-[#9ba8bc]">Minimum 50 characters</span>
              </div>
              <textarea
                rows={7}
                placeholder="Describe your living situation this quarter. What is going well? What could be improved?"
                className="w-full resize-none rounded-2xl border border-[#d4deee] bg-[#f9fbff] p-4 text-sm text-[#3e4a5f] outline-none transition focus:border-[#5b62f6] focus:ring-2 focus:ring-[#e7eaff] placeholder:text-[#9aa7bb]"
              />
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#e4e8f0] bg-[#f4f6fb] p-4">
              <Lightbulb size={16} className="mt-[1px] shrink-0 text-[#5b62f6]" />
              <p className="text-xs leading-5 text-slate-600">
                <span className="font-semibold text-[#5b62f6]">Tip:</span> Be honest with yourself. This reflection helps your mentors provide better support and understand any external challenges you might be facing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#e7ebf3] bg-[#f8f9fc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
            <button
              onClick={() => activeStep > 0 && setActiveStep(activeStep - 1)}
              disabled={activeStep === 0}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe5f0] bg-white px-5 py-2.5 text-sm font-semibold text-[#c0cad9] disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:gap-4">
              <span className="text-xs font-medium text-[#8f9fb5]">Answers are autosaved</span>
              <button
                onClick={() => (activeStep < 7 ? setActiveStep(activeStep + 1) : onComplete())}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5b62f6] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,98,246,0.35)] transition hover:bg-[#4d55ee]"
              >
                {activeStep === 7 ? "Submit Evaluation" : "Next Area"}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewEvaluation;
