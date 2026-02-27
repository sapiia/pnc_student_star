import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Bell, 
  Settings,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

const MEETINGS = [
  {
    id: '1',
    teacher: 'Ms. Sarah Evans',
    subject: 'Mathematics',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    type: 'In-person',
    location: 'Office 302',
    date: 'Feb 24, 2026',
    time: '02:00 PM - 02:30 PM',
    status: 'Pending',
    message: "Hi Alex, I'd like to discuss your recent calculus assessment results and plan for the next unit. Please let me know if this time works for you."
  },
  {
    id: '2',
    teacher: 'Mr. James Wilson',
    subject: 'World History',
    avatar: 'https://picsum.photos/seed/james/100/100',
    type: 'Online',
    location: 'Google Meet',
    date: 'Feb 26, 2026',
    time: '10:00 AM - 10:15 AM',
    status: 'Confirmed',
    message: "Quick check-in regarding your essay progress. We can do this via video call."
  }
];

export default function MeetingPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('1');
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  const selectedMeeting = MEETINGS.find(m => m.id === selectedId);

  const handleAccept = (id: string) => {
    setAcceptedIds(prev => [...prev, id]);
  };

  const isAccepted = acceptedIds.includes(selectedId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Meetings</span>
          </nav>
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
          {/* Meeting List Sidebar */}
          <div className="w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Meetings</h2>
              <p className="text-xs text-slate-500 mt-1">You have 1 new meeting request</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MEETINGS.map((meeting) => (
                <button 
                  key={meeting.id}
                  onClick={() => setSelectedId(meeting.id)}
                  className={cn(
                    "w-full p-6 flex gap-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 group relative",
                    selectedId === meeting.id && "bg-slate-50"
                  )}
                >
                  {selectedId === meeting.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="size-12 rounded-full overflow-hidden shrink-0">
                    <img src={meeting.avatar} alt={meeting.teacher} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{meeting.teacher}</p>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        meeting.status === 'Pending' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-primary mb-1">{meeting.subject}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{meeting.date}</span>
                    </div>
                  </div>
                  {meeting.status === 'Pending' && (
                    <div className="size-2 bg-red-500 rounded-full mt-1 shrink-0 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Detail View */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selectedMeeting ? (
              <div className="max-w-3xl mx-auto p-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={selectedMeeting.id}
                >
                  <div className="flex items-center gap-6 mb-10">
                    <div className="size-20 rounded-2xl overflow-hidden shadow-lg">
                      <img src={selectedMeeting.avatar} alt={selectedMeeting.teacher} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedMeeting.teacher}</h2>
                      <p className="text-primary font-bold">{selectedMeeting.subject}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="font-bold text-slate-900">{selectedMeeting.date}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="font-bold text-slate-900">{selectedMeeting.time}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        {selectedMeeting.type === 'Online' ? <Video className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                        <p className="font-bold text-slate-900">{selectedMeeting.location}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                        <p className="font-bold text-slate-900">{selectedMeeting.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-12">
                    <h3 className="text-lg font-bold text-slate-900">Message from Teacher</h3>
                    <div className="p-8 bg-primary/5 border-l-4 border-primary rounded-r-2xl italic text-slate-700 leading-relaxed">
                      "{selectedMeeting.message}"
                    </div>
                  </div>

                  {selectedMeeting.status === 'Pending' && !isAccepted ? (
                    <div className="flex gap-4 pt-10 border-t border-slate-100">
                      <button 
                        onClick={() => handleAccept(selectedMeeting.id)}
                        className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Accept Meeting
                      </button>
                      <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Reschedule
                      </button>
                    </div>
                  ) : (
                    <div className="pt-10 border-t border-slate-100">
                       <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4 text-emerald-700">
                          <CheckCircle2 className="w-8 h-8" />
                          <div>
                            <p className="font-bold">Meeting Confirmed</p>
                            <p className="text-sm opacity-80">You have accepted this meeting request. A calendar invite has been sent to your email.</p>
                          </div>
                       </div>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Calendar className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a meeting to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
