import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Shield, 
  Clock, 
  CheckCheck,
  MessageSquare,
  Bell,
  Settings,
  Paperclip,
  Smile,
  Search,
  User,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TeacherSidebar from '../components/TeacherSidebar';
import { cn } from '../lib/utils';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  type: 'Admin' | 'Student' | 'Teacher';
  status: 'Online' | 'Offline';
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

const CONTACTS: Contact[] = [
  {
    id: 'admin-1',
    name: 'System Administrator',
    role: 'Admin Support',
    avatar: '',
    type: 'Admin',
    status: 'Online',
    lastMessage: 'I\'ll look into this right away...',
    timestamp: '10:45 AM',
    unreadCount: 0
  },
  {
    id: 'teacher-1',
    name: 'John Smith',
    role: 'Mobile Dev Instructor',
    avatar: 'https://picsum.photos/seed/john/100/100',
    type: 'Teacher',
    status: 'Online',
    lastMessage: 'Let\'s sync on the Gen 2026 curriculum.',
    timestamp: '11:20 AM',
    unreadCount: 1
  },
  {
    id: 'teacher-2',
    name: 'Emily Davis',
    role: 'Soft Skills Mentor',
    avatar: 'https://picsum.photos/seed/emily/100/100',
    type: 'Teacher',
    status: 'Offline',
    lastMessage: 'The workshop materials are ready.',
    timestamp: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 'student-1',
    name: 'Sokha Mean',
    role: 'Gen 2026 • Web A',
    avatar: 'https://picsum.photos/seed/sokha/100/100',
    type: 'Student',
    status: 'Online',
    lastMessage: 'Thank you for the feedback, teacher!',
    timestamp: '09:15 AM',
    unreadCount: 2
  },
  {
    id: 'student-2',
    name: 'Dany Chan',
    role: 'Gen 2026 • Web A',
    avatar: 'https://picsum.photos/seed/dany/100/100',
    type: 'Student',
    status: 'Offline',
    lastMessage: 'I have a question about the evaluation.',
    timestamp: 'Yesterday',
    unreadCount: 0
  },
  {
    id: 'student-3',
    name: 'Leakna Roeun',
    role: 'Gen 2026 • Web A',
    avatar: 'https://picsum.photos/seed/leakna/100/100',
    type: 'Student',
    status: 'Online',
    lastMessage: 'Evaluation submitted!',
    timestamp: '2 days ago',
    unreadCount: 0
  }
];

const MOCK_MESSAGES: Record<string, any[]> = {
  'admin-1': [
    { id: '1', sender: 'Admin', content: 'Hello Sarah, how can I help you today?', timestamp: 'Yesterday, 10:25 AM', isMe: false },
    { id: '2', sender: 'Me', content: 'Hi Admin, I am having trouble accessing the Q1 evaluation reports for Gen 2026 Mobile A. Could you please check my permissions?', timestamp: 'Yesterday, 10:30 AM', isMe: true },
    { id: '3', sender: 'Admin', content: 'I\'ll look into this right away. Give me a few minutes to check the system logs.', timestamp: 'Yesterday, 10:45 AM', isMe: false }
  ],
  'student-1': [
    { id: '1', sender: 'Me', content: 'Hi Sokha, I noticed your self-evaluation is missing some details in the "Soft Skills" section.', timestamp: '08:30 AM', isMe: true },
    { id: '2', sender: 'Student', content: 'Oh, sorry teacher! I will update it right now.', timestamp: '08:45 AM', isMe: false },
    { id: '3', sender: 'Student', content: 'Thank you for the feedback, teacher!', timestamp: '09:15 AM', isMe: false }
  ],
  'teacher-1': [
    { id: '1', sender: 'Teacher', content: 'Hi Sarah, do you have the latest curriculum for Gen 2026?', timestamp: '11:15 AM', isMe: false },
    { id: '2', sender: 'Me', content: 'Yes, I\'ll send it over in a moment.', timestamp: '11:20 AM', isMe: true }
  ]
};

export default function TeacherMessagesPage() {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<Contact>(CONTACTS[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = CONTACTS.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = MOCK_MESSAGES[selectedContact.id] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Messages</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">3 New Messages</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/teacher/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Contacts List */}
          <div className="w-full md:w-[350px] border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-6 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</p>
              </div>
              {filteredContacts.filter(c => c.type === 'Admin').map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full p-6 text-left border-b border-slate-50 transition-all relative group",
                    selectedContact.id === contact.id ? "bg-primary/5" : "hover:bg-slate-50"
                  )}
                >
                  {selectedContact.id === contact.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">{contact.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{contact.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{contact.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="px-6 mt-8 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teachers</p>
              </div>
              {filteredContacts.filter(c => c.type === 'Teacher').map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full p-6 text-left border-b border-slate-50 transition-all relative group",
                    selectedContact.id === contact.id ? "bg-primary/5" : "hover:bg-slate-50"
                  )}
                >
                  {selectedContact.id === contact.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                      <img src={contact.avatar} alt={contact.name} />
                      {contact.status === 'Online' && (
                        <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">{contact.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{contact.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{contact.lastMessage}</p>
                      {contact.unreadCount ? (
                        <div className="mt-2 flex justify-end">
                          <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{contact.unreadCount}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}

              <div className="px-6 mt-8 mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</p>
              </div>
              {filteredContacts.filter(c => c.type === 'Student').map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full p-6 text-left border-b border-slate-50 transition-all relative group",
                    selectedContact.id === contact.id ? "bg-primary/5" : "hover:bg-slate-50"
                  )}
                >
                  {selectedContact.id === contact.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                      <img src={contact.avatar} alt={contact.name} />
                      {contact.status === 'Online' && (
                        <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">{contact.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{contact.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-medium">{contact.lastMessage}</p>
                      {contact.unreadCount ? (
                        <div className="mt-2 flex justify-end">
                          <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{contact.unreadCount}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedContact.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Chat Header */}
                <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-12 rounded-2xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center",
                      selectedContact.type === 'Admin' ? "bg-primary/10 text-primary" : "bg-slate-200"
                    )}>
                      {selectedContact.type === 'Admin' ? (
                        <Shield className="w-6 h-6" />
                      ) : (
                        <img src={selectedContact.avatar} alt={selectedContact.name} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{selectedContact.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "size-2 rounded-full",
                          selectedContact.status === 'Online' ? "bg-emerald-500" : "bg-slate-300"
                        )} />
                        <p className="text-xs font-bold text-slate-500">{selectedContact.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  {currentMessages.length > 0 ? (
                    currentMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex gap-4 max-w-2xl",
                          msg.isMe ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "size-10 rounded-xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center",
                          msg.isMe ? "bg-slate-200" : (selectedContact.type === 'Admin' ? "bg-primary/10 text-primary" : "bg-slate-200")
                        )}>
                          {msg.isMe ? (
                            <img src="https://picsum.photos/seed/sarah/100/100" alt="Me" />
                          ) : (
                            selectedContact.type === 'Admin' ? <Shield className="w-5 h-5" /> : <img src={selectedContact.avatar} alt={selectedContact.name} />
                          )}
                        </div>
                        <div className={cn(
                          "space-y-2",
                          msg.isMe ? "text-right" : ""
                        )}>
                          <div className={cn(
                            "p-6 rounded-2xl shadow-sm border",
                            msg.isMe 
                              ? "bg-primary text-white border-primary rounded-tr-none shadow-primary/20" 
                              : "bg-white text-slate-700 border-slate-200 rounded-tl-none"
                          )}>
                            <p className="leading-relaxed font-medium">
                              {msg.content}
                            </p>
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 text-[10px] font-bold text-slate-400",
                            msg.isMe ? "justify-end" : ""
                          )}>
                            {msg.isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                            <Clock className="w-3 h-3" />
                            <span>{msg.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">No messages yet</h3>
                      <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
                        Start a conversation with {selectedContact.name} by typing a message below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-8 bg-white border-t border-slate-200">
                  <div className="max-w-4xl mx-auto">
                    <div className="relative">
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Type your message to ${selectedContact.name}...`}
                        className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                        rows={2}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Smile className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button className="size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
