import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, X, Filter, RotateCcw } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

type GenderOption = 'All Genders' | 'Male' | 'Female';
type SortKey = 'name' | 'rating' | 'generation' | 'class' | 'gender' | 'status';
type SortDirection = 'asc' | 'desc';

interface TeacherHeaderProps {
  title: string;
  subtitle?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  selectedGen?: string;
  selectedClass?: string;
  selectedGender?: GenderOption;
  generations?: string[];
  classes?: string[];
  onGenChange?: (gen: string) => void;
  onClassChange?: (cls: string) => void;
  onGenderChange?: (gender: GenderOption) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  notificationCount?: number;
}

export default function TeacherHeader(props: TeacherHeaderProps) {
  const {
    title, subtitle, showFilters, showSearch, searchPlaceholder = 'Search...',
    selectedGen = 'All Generations', selectedClass = 'All Classes', selectedGender = 'All Genders',
    generations = [], classes = [], onGenChange, onClassChange, onGenderChange,
    searchQuery = '', onSearchChange, notificationCount = 0,
  } = props;

  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const gens = useMemo(() => ['All Generations', ...generations], [generations]);
  const classOptions = useMemo(() => ['All Classes', ...classes], [classes]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGen !== 'All Generations') count++;
    if (selectedClass !== 'All Classes') count++;
    if (selectedGender !== 'All Genders') count++;
    return count;
  }, [selectedGen, selectedClass, selectedGender]);

  const clearAllFilters = () => {
    onGenChange?.('All Generations');
    onClassChange?.('All Classes');
    onGenderChange?.('All Genders');
    onSearchChange?.('');
  };

  const Dropdown = ({ id, label, options, current, onSelect, className, icon }: any) => (
    <div className="relative">
      <button
        onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-2 border",
          activeDropdown === id 
            ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm",
          className
        )}
      >
        {icon && icon}
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform opacity-60 ml-auto", activeDropdown === id && "rotate-180 opacity-100")} />
      </button>
      <AnimatePresence>
        {activeDropdown === id && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 min-w-[180px] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden py-1.5"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {options.map((opt: any) => (
                <button
                  key={opt}
                  onClick={() => {
                    onSelect(opt);
                    setActiveDropdown(null);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-xs font-bold transition-colors flex justify-between items-center",
                    opt === current ? "text-primary bg-primary/5" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {opt}
                  {opt === current && <div className="size-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div ref={headerRef} className="sticky top-0 z-40 w-full">
      <header className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding */}
        {!isMobileSearchOpen && (
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-slate-900 truncate leading-tight tracking-tight">{title}</h1>
            {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] truncate">{subtitle}</p>}
          </div>
        )}

        {/* Right: Actions */}
        <div className={cn("flex items-center gap-2 md:gap-4", isMobileSearchOpen ? "w-full" : "")}>
          
          {/* Search Bar */}
          {showSearch && (
            <div className={cn("relative flex items-center", isMobileSearchOpen ? "w-full" : "")}>
              <AnimatePresence mode="wait">
                {isMobileSearchOpen ? (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center w-full gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm font-medium outline-none ring-2 ring-primary/10"
                    />
                    <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 bg-slate-100 rounded-xl">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center">
                    <button onClick={() => setIsMobileSearchOpen(true)} className="p-2.5 md:hidden text-slate-500 bg-slate-50 rounded-xl">
                      <Search className="w-5 h-5" />
                    </button>
                    <div className="hidden md:block relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-48 lg:w-72 pl-11 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:border-primary/20 transition-all outline-none"
                      />
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Improved Filters */}
          {!isMobileSearchOpen && showFilters && (
            <div className="hidden lg:flex items-center gap-2">
              <Dropdown 
                id="generation" 
                label={selectedGen.includes('All') ? 'All Generations' : `Gen: ${selectedGen}`} 
                options={gens} 
                current={selectedGen} 
                onSelect={onGenChange} 
                icon={<div className="size-1.5 rounded-full bg-primary/40 animate-pulse" />} 
              />
              <Dropdown 
                id="class" 
                label={selectedClass.includes('All') ? 'All Classes' : `Class: ${selectedClass}`} 
                options={classOptions} 
                current={selectedClass} 
                onSelect={onClassChange} 
              />
              <Dropdown
                id="gender"
                label={selectedGender === 'All Genders' ? 'All Genders' : selectedGender}
                options={['All Genders', 'Male', 'Female']}
                current={selectedGender}
                onSelect={onGenderChange}
                className={cn(
                  "transition-all",
                  selectedGender === 'Male' && "text-blue-600 border-blue-200 bg-blue-50/50",
                  selectedGender === 'Female' && "text-pink-600 border-pink-200 bg-pink-50/50"
                )}
              />
            </div>
          )}

          {/* Notifications */}
          {!isMobileSearchOpen && (
            <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200">
              <button onClick={() => navigate('/teacher/notifications')} className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl relative">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Active Filter Summary Bar */}
      <AnimatePresence>
        {(activeFiltersCount > 0 || searchQuery) && !isMobileSearchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white border-b border-slate-100 px-4 md:px-8 py-2.5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <Filter className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Filters:</span>
            </div>
            {selectedGen !== 'All Generations' && <FilterTag label={selectedGen} onClear={() => onGenChange?.('All Generations')} />}
            {selectedClass !== 'All Classes' && <FilterTag label={selectedClass} onClear={() => onClassChange?.('All Classes')} />}
            {selectedGender !== 'All Genders' && <FilterTag label={selectedGender} onClear={() => onGenderChange?.('All Genders')} />}
            {searchQuery && <FilterTag label={`"${searchQuery}"`} onClear={() => onSearchChange?.('')} />}
            <button onClick={clearAllFilters} className="ml-auto text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 uppercase tracking-wider">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterTag({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
      <span className="text-[11px] font-bold">{label}</span>
      <button onClick={onClear} className="hover:bg-slate-200 rounded p-0.5 transition-colors">
        <X className="w-3 h-3 text-slate-400 hover:text-slate-900" />
      </button>
    </motion.div>
  );
}