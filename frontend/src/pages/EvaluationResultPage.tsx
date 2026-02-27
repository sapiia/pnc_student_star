import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  History, 
  TrendingUp, 
  Lightbulb, 
  PartyPopper,
  Home,
  Briefcase,
  Users,
  Heart,
  Smile,
  Brain,
  CreditCard,
  Wrench,
  ArrowUp,
  ArrowDown,
  Minus,
  LayoutDashboard,
  Bell,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { CRITERIA } from '../constants';
import StarRating from '../components/StarRating';
import RadarChart from '../components/RadarChart';
import Sidebar from '../components/Sidebar';

export default function EvaluationResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { scores, reflections } = location.state || {};

  // Map scores to radar data format
  const radarData = CRITERIA.map(c => ({
    subject: c.label,
    prev: 70, // Mock previous data
    curr: scores ? (scores[c.key] || 0) * 20 : 80 // Scale 1-5 to 0-100
  }));

  const radarKeys = [
    { key: 'prev', name: 'Previous Quarter', color: '#94a3b8', fill: '#94a3b8' },
    { key: 'curr', name: 'Current Quarter', color: '#5d5fef', fill: '#5d5fef' },
  ];

  const getIcon = (iconName: string, className?: string) => {
    switch (iconName) {
      case 'Home': return <Home className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Smile': return <Smile className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Wrench': return <Wrench className={className} />;
      default: return <Star className={className} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Evaluation Results</h2>
          </div>
          <div className="flex items-center gap-4">
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
          <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
            {/* Success Header Section */}
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
              <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h1 className="text-slate-900 text-3xl md:text-4xl font-bold leading-tight mb-2">Evaluation Complete!</h1>
              <p className="text-slate-600 text-lg max-w-2xl">
                Great job on finishing your Q4 2024 assessment. You've shown significant progress in multiple areas!
              </p>
            </motion.section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Performance Overview */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-slate-900 text-xl font-bold">Performance Overview</h3>
                    <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-slate-300" />
                        <span className="text-slate-500">Q3 2024</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-primary">Q4 2024</span>
                      </div>
                    </div>
                  </div>
                  
                  <RadarChart data={radarData} dataKeys={radarKeys} />

                  <div className="mt-8 flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-medium">Global Average</p>
                      <p className="text-2xl font-bold text-slate-900">4.2 <span className="text-emerald-500 text-sm font-medium">+0.4</span></p>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-slate-500 text-xs font-medium">Rank</p>
                      <p className="text-2xl font-bold text-slate-900">Top 15%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Insights & Actions */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Growth Insights Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-slate-900 text-lg font-bold">Growth Insights</h3>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-emerald-800">Job & Study</h4>
                      <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">+1.5 Stars</span>
                    </div>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      Outstanding improvement! Your dedication to academic deadlines and peer collaboration has significantly boosted your score this quarter.
                    </p>
                  </div>
                </div>

                {/* Areas for Focus Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="text-slate-900 text-lg font-bold">Areas for Focus</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 text-sm">Money & Payment</span>
                        <span className="text-rose-500 text-xs font-bold">-0.2 Trend</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                        "Try setting a weekly budget to stabilize your score and avoid last-minute payment stress."
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-700 text-sm">Life Skills</span>
                        <span className="text-amber-600 text-xs font-bold">Low Score (2.8)</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                        "Consider attending the upcoming workshop on 'Effective Communication' to boost this pillar."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <section className="flex flex-col gap-4">
              <h2 className="text-slate-900 text-2xl font-bold">Criteria Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CRITERIA.map((criterion, idx) => {
                  const trend = idx % 3 === 0 ? 'up' : idx % 3 === 1 ? 'down' : 'stable';
                  const value = idx % 3 === 0 ? '0.5' : idx % 3 === 1 ? '0.2' : '0.0';
                  
                  return (
                    <motion.div 
                      key={criterion.key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-2 ${criterion.bgColor} rounded-lg ${criterion.color}`}>
                          {getIcon(criterion.icon, "w-5 h-5")}
                        </div>
                        <span className={`text-xs font-bold flex items-center gap-1 ${
                          trend === 'up' ? 'text-emerald-500' : 
                          trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                        }`}>
                          {trend === 'up' && <ArrowUp className="w-3 h-3" />}
                          {trend === 'down' && <ArrowDown className="w-3 h-3" />}
                          {trend === 'stable' && <Minus className="w-3 h-3" />}
                          {value}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{criterion.label}</h4>
                        <StarRating rating={scores ? scores[criterion.key] : (idx % 2 === 0 ? 4 : 5)} className="mt-1" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Navigation Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pb-12">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Return to Dashboard
              </button>
              <button 
                onClick={() => navigate('/history')}
                className="w-full sm:w-auto px-8 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <History className="w-5 h-5" />
                View Full History
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
