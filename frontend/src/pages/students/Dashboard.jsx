import React from 'react';
import { 
  Home, Briefcase, Users, Heart, 
  Smile, Lightbulb, Wallet, BookOpen, 
  Plus, ChevronRight 
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const radarData = [
  { subject: 'Living', A: 80, B: 110, fullMark: 150 },
  { subject: 'Job', A: 98, B: 130, fullMark: 150 },
  { subject: 'Health', A: 86, B: 130, fullMark: 150 },
  { subject: 'Skill', A: 99, B: 100, fullMark: 150 },
  { subject: 'Social', A: 85, B: 90, fullMark: 150 },
];

const StatCard = ({ icon: Icon, title, rating, color }) => (
  <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="flex gap-1 mt-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg ${i < rating ? 'text-indigo-500' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = ({ onStartEvaluation }) => {
  return (
    <div className="min-h-screen bg-[#f8faff] p-4 font-sans md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="bg-white rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between shadow-sm border border-gray-50">
          <div className="max-w-xl space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">Hello, Sokha! Ready for your Q1 2024 Evaluation?</h1>
            <p className="text-gray-500 leading-relaxed">
              Track your progress across 8 key areas of development. Regular self-reflection helps you stay focused on your personal and professional growth goals.
            </p>
            <button
              onClick={onStartEvaluation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
              Start New Evaluation
            </button>
          </div>
          <div className="mt-8 md:mt-0 w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
             <Lightbulb size={64} className="text-indigo-400" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Current Status (Q1 2024)</h2>
              <span className="text-xs font-medium text-gray-400">Last updated: Oct 12, 2023</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard icon={Home} title="Living" rating={4} color="bg-blue-500" />
              <StatCard icon={Briefcase} title="Job & Study" rating={5} color="bg-orange-500" />
              <StatCard icon={Users} title="Human & Support" rating={3} color="bg-purple-500" />
              <StatCard icon={Heart} title="Health" rating={4} color="bg-red-500" />
              <StatCard icon={Smile} title="Your Feeling" rating={3} color="bg-pink-500" />
              <StatCard icon={Lightbulb} title="Choice & Behavior" rating={4} color="bg-yellow-500" />
              <StatCard icon={Wallet} title="Money & Payment" rating={3} color="bg-green-500" />
              <StatCard icon={BookOpen} title="Life Skill" rating={4} color="bg-indigo-500" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Historical Growth</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Radar name="Q1 2024" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Feedback</h2>
                <button className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: "Serey Roth", time: "2 days ago", text: "Great progress in Job & Study this month! I noticed your focus during the JS project was excellent." },
                  { name: "Dara Vann", time: "1 week ago", text: "Let's focus more on Human & Support next quarter. Teamwork is as vital as coding skills." }
                ].map((feedback, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-none">{feedback.name}</p>
                        <p className="text-[10px] text-gray-400">{feedback.time}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 italic leading-relaxed">"{feedback.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
