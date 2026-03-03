import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const FAQS = [
  {
    question: "How often should I complete an evaluation?",
    answer: "Evaluations are typically completed at the end of each academic quarter. However, you can start a self-evaluation at any time to track your personal growth."
  },
  {
    question: "Who can see my evaluation results?",
    answer: "Your evaluation results are visible to you, your assigned mentors, and the academic department heads. This helps us provide tailored support for your development."
  },
  {
    question: "What if I disagree with a teacher's feedback?",
    answer: "We encourage open dialogue. You can use the 'Ask a Question' button on any feedback message to start a conversation with your teacher or schedule a meeting with your mentor."
  },
  {
    question: "How are the 8 life areas calculated?",
    answer: "The scores are a combination of your self-evaluation ratings and qualitative feedback from your teachers, mapped across our holistic development rubric."
  }
];

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-12 text-center">
            <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h1>
            <p className="text-slate-500 mt-4 text-lg">Everything you need to know about the PNC Student Star platform.</p>
          </header>

          <div className="relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  {expandedIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {expandedIndex === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6"
                    >
                      <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-50">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-primary rounded-3xl text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="text-primary-100 mb-8">We're here to help you succeed on your journey.</p>
            <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
