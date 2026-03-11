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
  Settings,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';

const RESULTS_PER_PAGE = 6;

const CATEGORIES = [
  { id: 'all', label: 'All Articles', count: 89 },
  { id: 'academics', label: 'Academics', count: 45 },
  { id: 'administrative', label: 'Administrative', count: 12 },
  { id: 'support', label: 'Support', count: 8 },
  { id: 'documentation', label: 'Documentation', count: 24 },
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
    title: 'Exporting evaluation reports for review',
    description: 'A technical guide for administrators on how to generate and export comprehensive evaluation data into CSV or PDF formats for further internal analysis and reporting.',
    updated: 'Aug 15, 2023',
    helpful: 42,
    readTime: '8 min read'
  }
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('evaluation');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);

  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return RESULTS.filter((result) => {
      const matchesCategory = activeCategory === 'all'
        ? true
        : result.category.toLowerCase() === activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = `${result.title} ${result.description} ${result.category}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / RESULTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * RESULTS_PER_PAGE;
    return filteredResults.slice(start, start + RESULTS_PER_PAGE);
  }, [currentPage, filteredResults]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, idx) => idx + 1);

    let start = currentPage - 1;
    let end = currentPage + 1;

    if (currentPage <= 2) {
      start = 2;
      end = 3;
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - 2;
      end = totalPages - 1;
    }

    start = Math.max(2, start);
    end = Math.min(totalPages - 1, end);

    const items: Array<number | '...'> = [1];

    if (start > 2) items.push('...');
    for (let page = start; page <= end; page += 1) items.push(page);
    if (end < totalPages - 1) items.push('...');

    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(nextPage);

    requestAnimationFrame(() => {
      resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <StudentMobileNav />
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 overflow-hidden">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary whitespace-nowrap">Dashboard</button>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
            <span className="font-bold text-slate-900 truncate">Help Center</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsFilterOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-1.5 md:size-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {/* Search Bar Section */}
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 mb-8 md:mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full -mr-16 md:-mr-32 -mt-16 md:-mt-32 blur-3xl" />
              
              <div className="relative z-10">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 md:mb-8 text-center tracking-tight">How can we help you?</h1>
                <div className="relative max-w-3xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 md:pl-14 pr-4 md:pr-32 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl md:rounded-[2rem] text-sm md:text-lg focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                  />
                  <button className="hidden md:block absolute right-2.5 top-2.5 bottom-2.5 bg-primary text-white px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    Search
                  </button>
                </div>
                <p className="text-center text-slate-500 mt-4 text-xs md:text-sm font-medium">
                  Showing results for '<span className="font-bold text-slate-900 italic">{searchQuery}</span>'
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              {/* Desktop Sidebar Filters */}
              <aside className="hidden lg:block lg:col-span-3 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                          activeCategory === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white text-slate-600 shadow-sm border border-transparent hover:border-slate-200"
                        )}
                      >
                        <span className="text-sm font-black uppercase tracking-widest">{cat.label}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg", activeCategory === cat.id ? "bg-white/20" : "bg-slate-100 text-slate-400")}>{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                   <div className="relative z-10 space-y-4">
                     <h4 className="text-xl font-black tracking-tight">Need direct help?</h4>
                     <p className="text-xs text-slate-400 leading-relaxed font-bold">Our support team is ready to assist you anytime.</p>
                     <button className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                       <MessageCircle className="w-4 h-4" />
                       Start Live Chat
                     </button>
                     <button className="w-full flex items-center justify-center gap-2 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                       <Mail className="w-4 h-4" />
                       Email Support
                     </button>
                   </div>
                </div>
              </aside>

              {/* Mobile Filter Modal */}
              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsFilterOpen(false)}
                      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                    <motion.div 
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      className="fixed inset-y-4 right-4 w-[280px] bg-white rounded-[2.5rem] shadow-2xl z-50 lg:hidden p-8 flex flex-col"
                    >
                      <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-black uppercase tracking-widest">Filters</h3>
                        <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-500"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</h4>
                          <div className="space-y-2">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setIsFilterOpen(false); }}
                                className={cn(
                                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                                  activeCategory === cat.id ? "bg-primary text-white" : "bg-slate-50 text-slate-600"
                                )}
                              >
                                <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
                                <span className="text-[10px] font-bold opacity-60">{cat.count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-8">Apply Filters</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Results List */}
              <div className="lg:col-span-9 space-y-6 md:space-y-8">
                <div ref={resultsTopRef} />

                {filteredResults.length === 0 ? (
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <p className="text-slate-600 text-sm md:text-base font-semibold">No articles match your search.</p>
                    <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium">Try a different keyword or category.</p>
                  </div>
                ) : (
                  paginatedResults.map((result, idx) => (
                    <motion.div 
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {result.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          {result.readTime}
                        </div>
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors mb-4 cursor-pointer leading-tight">
                        {result.title}
                      </h2>
                      <p className="text-slate-500 text-xs md:text-base leading-relaxed mb-6 font-medium">
                        {result.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 md:gap-8 pt-6 border-t border-slate-50">
                        <span className="text-[10px] md:text-xs font-bold text-slate-400">Updated {result.updated}</span>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] md:text-xs font-black text-slate-600">{result.helpful} Helpful</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Pagination */}
                {filteredResults.length > 0 && totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 pt-8 md:pt-12 pb-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="size-10 md:size-12 flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary rounded-xl md:rounded-2xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {paginationItems.map((item, idx) => {
                      if (item === '...') {
                        return <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 font-black">...</span>;
                      }

                      return (
                        <button 
                          key={item}
                          onClick={() => goToPage(item)}
                          aria-current={item === currentPage ? 'page' : undefined}
                          className={cn(
                            "size-10 md:size-12 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all shadow-sm",
                            item === currentPage
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-white text-slate-500 hover:border-primary/20 border border-transparent"
                          )}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="size-10 md:size-12 flex items-center justify-center text-slate-400 hover:bg-white hover:text-primary rounded-xl md:rounded-2xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}


