import { useNavigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Search, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
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
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <StudentMobileNav />
        
        <header className="bg-white border-b border-slate-200 px-6 py-12 md:py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="size-16 md:size-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8"
            >
              <HelpCircle className="w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">Frequently Asked Questions</h1>
            <p className="text-slate-500 text-sm md:text-lg font-medium px-4">Everything you need to know about the PNC Student Star platform.</p>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          <div className="relative mb-8 md:mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for answers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm md:text-base font-medium"
            />
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-primary/20 transition-colors"
              >
                <button 
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full p-5 md:p-8 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors gap-4"
                >
                  <span className="font-black text-slate-900 text-sm md:text-lg leading-snug">{faq.question}</span>
                  <div className={cn(
                    "size-8 md:size-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                    expandedIndex === idx ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {expandedIndex === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedIndex === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 md:px-8 pb-5 md:pb-8"
                    >
                      <div className="pt-4 md:pt-6 border-t border-slate-100">
                        <p className="text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-black uppercase tracking-widest">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-16 md:mt-24 p-8 md:p-12 bg-primary rounded-[2.5rem] md:rounded-[3.5rem] text-white text-center relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Still have questions?</h3>
              <p className="text-primary-100 mb-8 md:mb-12 font-bold opacity-80 max-w-md mx-auto">We're here to help you succeed on your journey. Chat with us anytime.</p>
              <button 
                onClick={() => navigate('/meeting')}
                className="w-full md:w-auto bg-white text-primary px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto shadow-xl"
              >
                Contact Support
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}


