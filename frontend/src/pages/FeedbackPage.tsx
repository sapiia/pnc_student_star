import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  Bell, 
  Settings, 
  Printer, 
  Share2, 
  Zap, 
  Users, 
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import Sidebar from '../components/Sidebar';

const FEEDBACK_LIST = [
  {
    id: '1',
    teacher: 'Ms. Sarah Evans',
    subject: 'Mathematics',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    time: '10:45 AM',
    preview: 'Great work on the calculus problem set! Your approach to the derivative equations was...',
    unread: true
  },
  {
    id: '2',
    teacher: 'Mr. James Wilson',
    subject: 'World History',
    avatar: 'https://picsum.photos/seed/james/100/100',
    time: 'YESTERDAY',
    preview: 'I noticed a significant improvement in your essay structure. Keep focusing on secondar...',
    unread: true
  },
  {
    id: '3',
    teacher: 'Dr. Elena Rodriguez',
    subject: 'Biology Lab',
    avatar: 'https://picsum.photos/seed/elena/100/100',
    time: '2 DAYS AGO',
    preview: 'Your lab notes for the photosynthesis experiment were exceptionally detailed. On...',
    unread: true
  },
  {
    id: '4',
    teacher: 'Mr. David Chen',
    subject: 'Physics',
    avatar: 'https://picsum.photos/seed/david/100/100',
    time: 'OCT 12',
    preview: 'The project submission was on time and covered all criteria. Well done on the extra...',
    unread: false
  }
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('1');
  const [feedbackList, setFeedbackList] = useState(FEEDBACK_LIST);

  const handleMarkAllRead = () => {
    setFeedbackList(prev => prev.map(item => ({ ...item, unread: false })));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setFeedbackList(prev => prev.map(item => 
      item.id === id ? { ...item, unread: false } : item
    ));
  };

  const unreadCount = feedbackList.filter(f => f.unread).length;
  const currentFeedback = feedbackList.find(f => f.id === selectedId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search feedback by teacher or subject..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
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

        <div className="flex-1 flex overflow-hidden">
          {/* Feedback List Sidebar */}
          <div className="w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Feedback</h2>
                <p className="text-xs text-slate-500 mt-1">{unreadCount} unread messages</p>
              </div>
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {feedbackList.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    "w-full p-6 flex gap-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 group relative",
                    selectedId === item.id && "bg-slate-50"
                  )}
                >
                  {selectedId === item.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="size-12 rounded-full overflow-hidden shrink-0">
                    <img src={item.avatar} alt={item.teacher} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.teacher}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.time}</span>
                    </div>
                    <p className="text-xs font-bold text-primary mb-1">{item.subject}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.preview}</p>
                  </div>
                  {item.unread && (
                    <div className="size-2 bg-primary rounded-full mt-1 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Detail View */}
          <div className="flex-1 overflow-y-auto bg-white">
            {currentFeedback ? (
              <div className="max-w-4xl mx-auto p-10">
                {/* Teacher Profile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="size-20 rounded-2xl overflow-hidden shadow-lg">
                      <img src={currentFeedback.avatar} alt={currentFeedback.teacher} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentFeedback.teacher}</h2>
                      <p className="text-primary font-bold">{currentFeedback.subject} Department</p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                        <Star className="w-3 h-3" />
                        <span>{currentFeedback.time === '10:45 AM' ? 'Today' : currentFeedback.time} at 10:45 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 mb-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Excellence in {currentFeedback.subject}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100">
                    <Zap className="w-4 h-4" />
                    Fast Learner
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                    <Users className="w-4 h-4" />
                    Great Collaboration
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="space-y-6 text-slate-700 leading-relaxed">
                  <h3 className="text-xl font-bold text-slate-900">Feedback on Recent Performance</h3>
                  <p>
                    Dear Alex, I wanted to personally reach out and commend you on your recent progress in {currentFeedback.subject}. Your performance has been exceptional.
                  </p>
                  <p>
                    {currentFeedback.preview}... I was particularly impressed with how you handled the recent challenges in the curriculum. You demonstrated a high level of critical thinking and dedication.
                  </p>

                  <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl italic text-slate-600">
                    "Your dedication to participating in the after-school study groups has clearly paid off. Keep this momentum going into the next unit."
                  </div>

                  <p>
                    For next steps, I'd suggest continuing your current study habits. If you have any questions, feel free to drop by during my office hours.
                  </p>

                  <div className="pt-6">
                    <p className="font-bold text-slate-900">Best regards,</p>
                    <p>{currentFeedback.teacher}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-12 pt-10 border-t border-slate-100">
                  <button className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Ask a Question
                  </button>
                  <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Acknowledge Feedback
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a feedback message to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
