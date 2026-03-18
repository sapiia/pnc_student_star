import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

type GenderOption = 'All Genders' | 'Male' | 'Female';

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

export default function TeacherHeader({
  title,
  subtitle,
  showFilters = false,
  showSearch = false,
  searchPlaceholder = 'Search...',
  selectedGen = 'All Generations',
  selectedClass = 'All Classes',
  selectedGender = 'All Genders',
  generations = [],
  classes = [],
  onGenChange,
  onClassChange,
  onGenderChange,
  searchQuery = '',
  onSearchChange,
  notificationCount = 0,
}: TeacherHeaderProps) {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<'gen' | 'class' | 'gender' | null>(null);

  const gens = useMemo(() => ['All Generations', ...generations], [generations]);
  const classOptions = useMemo(() => ['All Classes', ...classes], [classes]);

  return (
    <header className="h-auto min-h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-2 md:py-0 flex items-center justify-between shrink-0 z-10">
      <div className="min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{title}</h1>
        {subtitle && (
          <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-2">
        {showFilters && (
          <div className="flex items-center gap-1 md:gap-2 bg-slate-100 p-1 rounded-xl relative scale-90 md:scale-100 origin-right">
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'gen' ? null : 'gen')}
                className={cn(
                  "px-2 md:px-3 py-1 md:py-1.5 rounded-lg shadow-sm text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                  activeDropdown === 'gen' ? "bg-primary text-white" : "bg-white text-primary"
                )}
              >
                {selectedGen.includes('All') ? 'All Gen' : selectedGen.replace('Gen ', 'GEN ')}
              </button>
              <AnimatePresence>
                {activeDropdown === 'gen' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 md:left-0 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  >
                    {gens.map(gen => (
                      <button
                        key={gen}
                        onClick={() => { onGenChange?.(gen); setActiveDropdown(null); }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        {gen}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'class' ? null : 'class')}
                className={cn(
                  "px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                  activeDropdown === 'class' ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                {selectedClass === 'All Classes' ? 'All Class' : selectedClass}
              </button>
              <AnimatePresence>
                {activeDropdown === 'class' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 md:left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  >
                    {classOptions.map(cls => (
                      <button
                        key={cls}
                        onClick={() => { onClassChange?.(cls); setActiveDropdown(null); }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        {cls}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'gender' ? null : 'gender')}
                className={cn(
                  "px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap",
                  activeDropdown === 'gender' ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                {selectedGender === 'All Genders' ? 'All Gender' : selectedGender}
              </button>
              <AnimatePresence>
                {activeDropdown === 'gender' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 md:left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  >
                    {(['All Genders', 'Male', 'Female'] as GenderOption[]).map(gender => (
                      <button
                        key={gender}
                        onClick={() => { onGenderChange?.(gender); setActiveDropdown(null); }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        {gender === 'All Genders' ? 'All Gender' : gender}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {showSearch && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-32 md:w-64 pl-10 pr-4 py-1.5 md:py-2 bg-slate-100 border-none rounded-full text-xs md:text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        )}

        <button
          onClick={() => navigate('/teacher/notifications')}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative shrink-0"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 md:min-w-5 h-4 md:h-5 px-1 rounded-full bg-rose-500 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center ring-2 ring-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

