import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  ChevronRight, 
  MessageCircle, 
  Mail, 
  Clock, 
  ThumbsUp, 
  ChevronLeft,
  Bell,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import Sidebar from '../components/Sidebar';

const CATEGORIES = [
  { id: 'academics', label: 'Academics', count: 45, checked: true },
  { id: 'administrative', label: 'Administrative', count: 12, checked: false },
  { id: 'support', label: 'Support', count: 8, checked: false },
  { id: 'documentation', label: 'Documentation', count: 24, checked: false },
];

const RESULTS = [
  {
    id: '1',
    category: 'Academics',
    title: 'How to complete a peer evaluation',
    description: 'This guide walks you through the step-by-step process of submitting a peer evaluation. Learn how to provide constructive feedback, use the grading rubric, and meet submission deadlines effectively.',
    updated: 'Oct 12, 2023',
    helpful: 124,
    readTime: '5 min read'
  },
  {
    id: '2',
    category: 'Documentation',
    title: 'Understanding teacher evaluation cycles',
    description: 'Learn about the frequency and criteria for teacher evaluation cycles. This article covers the metrics used by the administration to assess performance and professional growth.',
    updated: 'Sep 28, 2023',
    helpful: 89,
    readTime: '3 min read'
  },
  {
    id: '3',
    category: 'Administrative',
    title: 'Exporting evaluation reports for department review',
    description: 'A technical guide for administrators on how to generate and export comprehensive evaluation data into CSV or PDF formats for further internal analysis and reporting.',
    updated: 'Aug 15, 2023',
    helpful: 42,
    readTime: '8 min read'
  }
];

export default function HelpCenterPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Help Center</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search help..." 
                className="w-64 pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Search Bar Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input 
                  type="text" 
                  defaultValue="evaluation"
                  className="w-full pl-14 pr-32 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-8 rounded-xl font-bold hover:bg-primary/90 transition-all">
                  Search
                </button>
              </div>
              <p className="text-center text-slate-500 mt-4 text-sm">
                Showing 12 results for '<span className="font-bold text-slate-900 italic">evaluation</span>'
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar Filters */}
              <aside className="lg:col-span-3 space-y-10">
                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Category</h3>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                      <label key={cat.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${cat.checked ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
                            {cat.checked && <Star className="w-3 h-3 text-white fill-white" />}
                          </div>
                          <span className={`text-sm font-medium ${cat.checked ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{cat.label}</span>
                        </div>
                        <span className="text-xs text-slate-400">{cat.count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Posted */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Date Posted</h3>
                  <div className="space-y-3">
                    {['Any time', 'Past month', 'Past 6 months', 'Past year'].map((time, idx) => (
                      <label key={time} className="flex items-center gap-3 group cursor-pointer">
                        <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${idx === 0 ? 'border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
                          {idx === 0 && <div className="size-2.5 bg-primary rounded-full" />}
                        </div>
                        <span className={`text-sm font-medium ${idx === 0 ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl space-y-6">
                  <div className="text-center space-y-2">
                    <h4 className="font-bold text-slate-900">Still need help?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Our support team is available 24/7 to assist you with any questions.</p>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                      <MessageCircle className="w-5 h-5" />
                      Live Chat
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
                      <Mail className="w-5 h-5" />
                      Email Support
                    </button>
                  </div>
                </div>
              </aside>

              {/* Results List */}
              <div className="lg:col-span-9 space-y-8">
                <div className="space-y-6">
                  {RESULTS.map((result, idx) => (
                    <motion.div 
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {result.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Clock className="w-4 h-4" />
                          {result.readTime}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-4 cursor-pointer">
                        {result.title.split('evaluation').map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && <span className="underline decoration-primary/30 underline-offset-4">evaluation</span>}
                          </span>
                        ))}
                      </h2>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {result.description.split('evaluation').map((part, i, arr) => (
                          <span key={i}>
                            {part}
                            {i < arr.length - 1 && <span className="font-bold text-slate-900">evaluation</span>}
                          </span>
                        ))}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-6 text-xs text-slate-400">
                          <span>Updated {result.updated}</span>
                          <div className="flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{result.helpful} people found this helpful</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 pt-10 pb-20">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, '...', 12].map((page, idx) => (
                      <button 
                        key={idx}
                        className={`size-10 rounded-xl font-bold transition-all ${page === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
