"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError?: string;
  criteriaCount: number;
}

export function SubmitModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  submitError, 
  criteriaCount 
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            <div className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
              <Check className="w-10 h-10" />
            </div>
            
            <div className="text-center space-y-3 mb-8">
              <h3 className="text-2xl font-black text-slate-900">Ready to Submit?</h3>
              <p className="text-slate-500 leading-relaxed">
                You've completed all {criteriaCount} areas of your self-evaluation. Once submitted, your mentor will review your reflections and provide feedback.
              </p>
            </div>

            <div className="space-y-3">
              {submitError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                  {submitError}
                </div>
              ) : null}
              <button 
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="size-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Evaluation
                  </>
                )}
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Review Answers
              </button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

