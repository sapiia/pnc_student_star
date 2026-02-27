import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Bell, 
  HelpCircle, 
  PlusCircle,
  Home,
  Briefcase,
  Users,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import RadarChart from '../components/RadarChart';
import Sidebar from '../components/Sidebar';
import { CRITERIA } from '../constants';

const RECENT_FEEDBACK = [
  {
    id: '1',
    author: 'Serey Roth',
    authorRole: 'Mentor',
    avatar: 'https://picsum.photos/seed/serey/100/100',
    date: '2 days ago',
    content: '"Great progress in Job & Study this month! I noticed your focus during the JS project was excellent."'
  },
  {
    id: '2',
    author: 'Dara Vann',
    authorRole: 'Mentor',
    avatar: 'https://picsum.photos/seed/dara/100/100',
    date: '1 week ago',
    content: '"Let\'s focus more on Human & Support next quarter. Teamwork is as vital as coding skills."'
  }
];

const RADAR_DATA = [
  { subject: 'Living', A: 80, B: 60, fullMark: 100 },
  { subject: 'Study', A: 90, B: 70, fullMark: 100 },
  { subject: 'Human', A: 60, B: 75, fullMark: 100 },
  { subject: 'Health', A: 85, B: 80, fullMark: 100 },
  { subject: 'Feeling', A: 70, B: 75, fullMark: 100 },
  { subject: 'Behavior', A: 80, B: 70, fullMark: 100 },
];

const RADAR_KEYS = [
  { key: 'A', name: 'Q1 2024', color: '#5d5fef', fill: '#5d5fef' },
  { key: 'B', name: 'Q4 2023', color: '#94a3b8', fill: '#94a3b8' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Mocking the next evaluation date (3 months cycle)
  const [daysLeft, setDaysLeft] = useState(82); 
  const [showUrgentNotification, setShowUrgentNotification] = useState(false);

  // For demo purposes, let's allow toggling the urgent state
  const toggleUrgent = () => {
    setDaysLeft(prev => prev === 82 ? 3 : 82);
  };

  useEffect(() => {
    if (daysLeft <= 3) {
      setShowUrgentNotification(true);
    } else {
      setShowUrgentNotification(false);
    }
  }, [daysLeft]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'Smile': return <Smile className="w-6 h-6" />;
      case 'Brain': return <Brain className="w-6 h-6" />;
      case 'CreditCard': return <CreditCard className="w-6 h-6" />;
      case 'Wrench': return <Wrench className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Home className="w-4 h-4" />
            <span>/</span>
            <span className="font-medium text-slate-900">Student Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleUrgent}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              Demo: Toggle Urgent
            </button>
            <button className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 relative text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Urgent Notification */}
          <AnimatePresence>
            {daysLeft <= 3 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-4 text-rose-800"
              >
                <div className="size-10 bg-rose-500 text-white rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Action Required: Evaluation Window Opening Soon!</p>
                  <p className="text-xs opacity-80">Your next self-evaluation is scheduled in {daysLeft} days. Please prepare your self-reflection.</p>
                </div>
                <button 
                  onClick={() => navigate('/evaluate')}
                  className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors"
                >
                  View Schedule
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Welcome Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center h-full">
                <div className="p-8 flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Hello, Sokha! Ready for your Q1 2024 Evaluation?</h2>
                  <p className="text-slate-600 mb-6 max-w-xl">Track your progress across 8 key areas of development. Regular self-reflection helps you stay focused on your personal and professional growth goals.</p>
                  <button 
                    onClick={() => navigate('/evaluate')}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Start New Evaluation
                  </button>
                </div>
                <div className="w-full md:w-64 h-48 md:h-auto bg-primary/5 flex items-center justify-center">
                  <div className="relative">
                    <div className="size-32 bg-primary/20 rounded-full animate-pulse flex items-center justify-center">
                      <Star className="w-12 h-12 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Countdown Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock className="w-32 h-32 -mr-8 -mt-8" />
              </div>
              <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Next Evaluation In</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black">{daysLeft}</span>
                  <span className="text-xl font-bold text-slate-400">Days</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(daysLeft / 90) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Cycle: 3 Months</span>
                    <span>{Math.round((daysLeft / 90) * 100)}% Remaining</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Star Rating Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Current Status (Q1 2024)</h3>
                <span className="text-sm text-slate-500">Last updated: Oct 12, 2023</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CRITERIA.map((criterion, idx) => (
                  <motion.div 
                    key={criterion.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4"
                  >
                    <div className={`size-12 rounded-lg ${criterion.bgColor} ${criterion.color} flex items-center justify-center shrink-0`}>
                      {getIcon(criterion.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">{criterion.label}</p>
                      <StarRating rating={idx % 2 === 0 ? 4 : 5} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progress & Teacher Feedback */}
            <div className="space-y-8">
              {/* Progress Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-500">Historical Growth</h3>
                <RadarChart data={RADAR_DATA} dataKeys={RADAR_KEYS} />
              </div>

              {/* Teacher Feedback */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Feedback</h3>
                  <button 
                    onClick={() => navigate('/feedback')}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {RECENT_FEEDBACK.map((feedback) => (
                    <div key={feedback.id} className="flex gap-3">
                      <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        <img alt={feedback.author} src={feedback.avatar} />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold">{feedback.author} <span className="text-[10px] font-normal text-slate-400 block sm:inline sm:ml-2">{feedback.date}</span></p>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">{feedback.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
