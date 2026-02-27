import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  User, 
  Clock, 
  CheckCheck,
  ChevronRight,
  MessageSquare,
  Bell,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  sender: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  category: 'Technical' | 'Evaluation' | 'Student Issue' | 'General';
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: {
      name: 'Sarah Connor',
      role: 'Web Development Teacher',
      avatar: 'https://picsum.photos/seed/sarah/100/100'
    },
    content: 'Hi Admin, I am having trouble accessing the Q1 evaluation reports for Gen 2026 Mobile A. Could you please check my permissions?',
    timestamp: '10:30 AM',
    isRead: false,
    category: 'Technical'
  },
  {
    id: '2',
    sender: {
      name: 'John Smith',
      role: 'Mobile Development Teacher',
      avatar: 'https://picsum.photos/seed/john/100/100'
    },
    content: 'One of my students, David Miller, missed the evaluation deadline due to a medical emergency. Can we reopen it for him?',
    timestamp: 'Yesterday',
    isRead: true,
    category: 'Student Issue'
  },
  {
    id: '3',
    sender: {
      name: 'Emily Davis',
      role: 'Soft Skills Mentor',
      avatar: 'https://picsum.photos/seed/emily/100/100'
    },
    content: 'The new evaluation criteria look great! Just wanted to confirm if the weightage for "Teamwork" has been updated.',
    timestamp: '2 days ago',
    isRead: true,
    category: 'Evaluation'
  },
  {
    id: '4',
    sender: {
      name: 'Michael Brown',
      role: 'English Teacher',
      avatar: 'https://picsum.photos/seed/michael/100/100'
    },
    content: 'When is the next staff meeting scheduled? I need to present the student progress report.',
    timestamp: '3 days ago',
    isRead: true,
    category: 'General'
  }
];

export default function AdminMessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(MOCK_MESSAGES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Technical' | 'Student Issue'>('All');

  const filteredMessages = MOCK_MESSAGES.filter(msg => {
    const matchesSearch = msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Unread' && !msg.isRead) || 
                      (activeTab === msg.category);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Teacher Messages</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">2 New Messages</span>
            </div>
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
          {/* Messages List */}
          <div className="w-full md:w-[400px] border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Unread', 'Technical', 'Student Issue'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                      activeTab === tab 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={cn(
                    "w-full p-6 text-left border-b border-slate-50 transition-all relative group",
                    selectedMessage?.id === msg.id ? "bg-primary/5" : "hover:bg-slate-50"
                  )}
                >
                  {selectedMessage?.id === msg.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <img src={msg.sender.avatar} alt={msg.sender.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={cn("text-sm truncate", !msg.isRead ? "font-black text-slate-900" : "font-bold text-slate-700")}>
                          {msg.sender.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className={cn("text-xs line-clamp-2", !msg.isRead ? "font-bold text-slate-600" : "text-slate-500")}>
                        {msg.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                          msg.category === 'Technical' ? "bg-blue-100 text-blue-600" :
                          msg.category === 'Student Issue' ? "bg-rose-100 text-rose-600" :
                          msg.category === 'Evaluation' ? "bg-emerald-100 text-emerald-600" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {msg.category}
                        </span>
                        {!msg.isRead && (
                          <div className="size-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div 
                  key={selectedMessage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Content Header */}
                  <div className="p-8 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl overflow-hidden bg-slate-200 shadow-sm">
                        <img src={selectedMessage.sender.avatar} alt={selectedMessage.sender.name} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{selectedMessage.sender.name}</h3>
                        <p className="text-xs font-bold text-slate-500">{selectedMessage.sender.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex gap-4 max-w-3xl">
                      <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src={selectedMessage.sender.avatar} alt={selectedMessage.sender.name} />
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-slate-200">
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {selectedMessage.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Sent at {selectedMessage.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Reply Placeholder */}
                    <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
                      <div className="size-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" />
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="bg-primary p-6 rounded-2xl rounded-tr-none shadow-lg shadow-primary/20 text-white">
                          <p className="leading-relaxed font-medium">
                            I'll look into this right away. Give me a few minutes to check the system logs.
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400">
                          <CheckCheck className="w-3 h-3 text-primary" />
                          <span>Read • 10:45 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="p-8 bg-white border-t border-slate-200">
                    <div className="relative">
                      <textarea 
                        placeholder="Type your reply here..."
                        className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        rows={1}
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Attach File</button>
                      <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Use Template</button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Select a message</h3>
                  <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
                    Choose a conversation from the list on the left to view the details and reply.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
