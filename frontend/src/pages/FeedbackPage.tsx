import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Clock, MessageSquare, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/layout/sidebar/Sidebar';
import StudentMobileNav from '../components/StudentMobileNav';
import { cn } from '../lib/utils';

type FeedbackRecord = {
  id: number;
  teacher_id: number;
  student_id: number;
  evaluation_id?: number | null;
  evaluation_period?: string | null;
  comment: string;
  created_at?: string | null;
  teacher_name?: string | null;
  teacher_profile_image?: string | null;
};

type TeacherThread = {
  teacherId: number;
  teacherName: string;
  avatar: string;
  latestAt: string;
  latestText: string;
  count: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

const formatDateTime = (value?: string | null) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const resolveAvatarUrl = (value: string | null | undefined, fallback: string) => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [canViewTeacherFeedback, setCanViewTeacherFeedback] = useState(true);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const authUser = JSON.parse(raw);
      const resolvedStudentId = Number(authUser?.id);
      if (Number.isInteger(resolvedStudentId) && resolvedStudentId > 0) {
        setStudentId(resolvedStudentId);
      }
    } catch {
      setStudentId(null);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`);
      const data = await response.json().catch(() => null);
      if (!response.ok) return;
      const normalized = String((data as any)?.value ?? 'true').trim().toLowerCase();
      setCanViewTeacherFeedback(normalized !== 'false' && normalized !== '0');
    } catch {
      setCanViewTeacherFeedback(true);
    }
  }, []);

  const loadFeedbacks = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/student/${studentId}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error((data as any)?.error || 'Failed to load feedback.');
      }
      setFeedbacks(Array.isArray(data) ? (data as FeedbackRecord[]) : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load feedback.');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    void loadFeedbacks();
  }, [loadFeedbacks]);

  const threads = useMemo<TeacherThread[]>(() => {
    const fallbackAvatar = 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg';
    const byTeacher = new Map<number, FeedbackRecord[]>();
    for (const feedback of feedbacks) {
      const teacherId = Number(feedback.teacher_id);
      if (!Number.isInteger(teacherId) || teacherId <= 0) continue;
      if (!byTeacher.has(teacherId)) byTeacher.set(teacherId, []);
      byTeacher.get(teacherId)!.push(feedback);
    }

    const list: TeacherThread[] = [];
    for (const [teacherId, entries] of byTeacher.entries()) {
      const sorted = [...entries].sort((a, b) => {
        const left = new Date(String(a.created_at || '')).getTime();
        const right = new Date(String(b.created_at || '')).getTime();
        return (Number.isNaN(right) ? 0 : right) - (Number.isNaN(left) ? 0 : left);
      });
      const latest = sorted[0];
      const teacherName = String(latest?.teacher_name || '').trim() || `Teacher #${teacherId}`;
      const avatar = resolveAvatarUrl(latest?.teacher_profile_image, fallbackAvatar);
      list.push({
        teacherId,
        teacherName,
        avatar,
        latestAt: String(latest?.created_at || ''),
        latestText: String(latest?.comment || '').trim(),
        count: sorted.length,
      });
    }

    return list.sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
  }, [feedbacks]);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return threads;
    return threads.filter((thread) => thread.teacherName.toLowerCase().includes(query));
  }, [searchQuery, threads]);

  const selectedThread = useMemo(() => {
    if (!selectedTeacherId) return null;
    return threads.find((t) => t.teacherId === selectedTeacherId) || null;
  }, [selectedTeacherId, threads]);

  const selectedMessages = useMemo(() => {
    if (!selectedTeacherId) return [];
    return feedbacks
      .filter((f) => Number(f.teacher_id) === selectedTeacherId)
      .sort((a, b) => new Date(String(a.created_at || '')).getTime() - new Date(String(b.created_at || '')).getTime());
  }, [feedbacks, selectedTeacherId]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <StudentMobileNav />

        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between shrink-0 gap-4">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <aside
            className={cn(
              'w-full md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 transition-all duration-300 md:translate-x-0 pb-24 md:pb-0',
              isMobileChatOpen ? '-translate-x-full md:translate-x-0 hidden md:flex' : 'translate-x-0',
            )}
          >
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Teacher Feedback</h2>
              <p className="text-xs text-slate-500 mt-1">{filteredThreads.length} teacher{filteredThreads.length === 1 ? '' : 's'}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-sm font-medium text-slate-500">Loading feedback...</div>
              ) : !canViewTeacherFeedback ? (
                <div className="p-6 text-sm font-medium text-slate-500">Teacher feedback is currently hidden by admin settings.</div>
              ) : error ? (
                <div className="p-6 text-sm font-medium text-rose-600">{error}</div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-6 text-sm font-medium text-slate-500">No teacher feedback yet.</div>
              ) : (
                filteredThreads.map((thread) => {
                  const isActive = thread.teacherId === selectedTeacherId;
                  return (
                    <button
                      key={thread.teacherId}
                      type="button"
                      onClick={() => {
                        setSelectedTeacherId(thread.teacherId);
                        setIsMobileChatOpen(true);
                      }}
                      className={cn(
                        'w-full p-6 flex gap-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 group relative',
                        isActive && 'bg-slate-50',
                      )}
                    >
                      {isActive ? <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" /> : null}
                      <div className="size-12 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img src={thread.avatar} alt={thread.teacherName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{thread.teacherName}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
                            {formatDateTime(thread.latestAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{thread.latestText}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {thread.count} message{thread.count === 1 ? '' : 's'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section
            className={cn(
              'flex-1 flex flex-col bg-white md:bg-transparent overflow-hidden transition-all duration-300',
              isMobileChatOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 hidden md:flex',
            )}
          >
            <div className="bg-white border-b border-slate-200 p-4 md:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileChatOpen(false)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                  title="Back"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                {selectedThread ? (
                  <>
                    <div className="size-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={selectedThread.avatar} alt={selectedThread.teacherName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{selectedThread.teacherName}</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Feedback thread</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Select a teacher</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">View feedback details</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
              {selectedThread ? (
                <AnimatePresence initial={false}>
                  {selectedMessages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                              <Clock className="w-4 h-4" />
                              <span>{formatDateTime(message.created_at)}</span>
                            </div>
                            {message.evaluation_period ? (
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                                {message.evaluation_period}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {message.comment}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
                      <div className="size-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">No messages yet</h3>
                      <p className="text-slate-500 font-bold text-sm mt-2">Your teacher feedback will appear here.</p>
                    </div>
                  )}
                </AnimatePresence>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Select a teacher</h3>
                  <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">Choose a teacher to view feedback.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

