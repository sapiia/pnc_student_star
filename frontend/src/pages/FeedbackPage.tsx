import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  HelpCircle,
  Search,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { cn } from '../lib/utils';

type FeedbackItem = {
  id: number;
  teacher_id?: number;
  student_id?: number;
  evaluation_id?: number | null;
  teacher_name?: string;
  teacher_profile_image?: string | null;
  comment: string;
  created_at?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const formatDateLabel = (value?: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [canViewTeacherFeedback, setCanViewTeacherFeedback] = useState(true);

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

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!studentId) {
        setIsLoading(false);
        setFeedbackList([]);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        const [visibilityResponse, feedbackResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
          fetch(`${API_BASE_URL}/feedbacks/student/${studentId}`),
        ]);

        const visibilityData = await visibilityResponse.json().catch(() => ({}));
        const feedbackData = await feedbackResponse.json().catch(() => []);

        const visibilityValue = String(visibilityData?.value || 'true').trim().toLowerCase();
        const isVisible = visibilityValue !== 'false' && visibilityValue !== '0';
        setCanViewTeacherFeedback(isVisible);

        if (!isVisible) {
          setFeedbackList([]);
          setSelectedId(null);
          return;
        }

        if (!feedbackResponse.ok) {
          throw new Error(feedbackData?.error || 'Failed to load feedback.');
        }

        const normalizedFeedbacks = Array.isArray(feedbackData) ? feedbackData : [];
        setFeedbackList(normalizedFeedbacks);
        setSelectedId(normalizedFeedbacks[0]?.id ?? null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load feedback.');
        setFeedbackList([]);
        setSelectedId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [studentId]);

  const filteredFeedbacks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return feedbackList;

    return feedbackList.filter((item) => (
      String(item.teacher_name || '').toLowerCase().includes(normalizedQuery) ||
      String(item.comment || '').toLowerCase().includes(normalizedQuery)
    ));
  }, [feedbackList, searchQuery]);

  useEffect(() => {
    if (!filteredFeedbacks.length) {
      setSelectedId(null);
      return;
    }

    const hasSelection = filteredFeedbacks.some((item) => item.id === selectedId);
    if (!hasSelection) {
      setSelectedId(filteredFeedbacks[0].id);
    }
  }, [filteredFeedbacks, selectedId]);

  const currentFeedback = filteredFeedbacks.find((item) => item.id === selectedId) || filteredFeedbacks[0] || null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search feedback by teacher or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Feedback</h2>
                <p className="text-xs text-slate-500 mt-1">{filteredFeedbacks.length} messages</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-sm font-medium text-slate-500">Loading feedback...</div>
              ) : !canViewTeacherFeedback ? (
                <div className="p-6 text-sm font-medium text-slate-500">Teacher feedback is currently hidden by admin settings.</div>
              ) : loadError ? (
                <div className="p-6 text-sm font-medium text-rose-600">{loadError}</div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="p-6 text-sm font-medium text-slate-500">No feedback has been posted yet.</div>
              ) : filteredFeedbacks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'w-full p-6 flex gap-4 text-left border-b border-slate-50 transition-all hover:bg-slate-50 group relative',
                    selectedId === item.id && 'bg-slate-50'
                  )}
                >
                  {selectedId === item.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="size-12 rounded-full overflow-hidden shrink-0 bg-primary/10 text-primary flex items-center justify-center">
                    {item.teacher_profile_image ? (
                      <img src={item.teacher_profile_image} alt={item.teacher_name || 'Teacher'} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.teacher_name || 'Teacher'}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{formatDateLabel(item.created_at)}</span>
                    </div>
                    <p className="text-xs font-bold text-primary mb-1">Evaluation Feedback</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.comment}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {currentFeedback ? (
              <div className="max-w-4xl mx-auto p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="size-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg overflow-hidden">
                      {currentFeedback.teacher_profile_image ? (
                        <img
                          src={currentFeedback.teacher_profile_image}
                          alt={currentFeedback.teacher_name || 'Teacher'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentFeedback.teacher_name || 'Teacher'}</h2>
                      <p className="text-primary font-bold">Evaluation Feedback</p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                        <Star className="w-3 h-3" />
                        <span>{formatDateLabel(currentFeedback.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Feedback Available
                  </div>
                </div>

                <div className="space-y-6 text-slate-700 leading-relaxed">
                  <h3 className="text-xl font-bold text-slate-900">Teacher Comment</h3>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 whitespace-pre-wrap text-sm leading-relaxed">
                    {currentFeedback.comment}
                  </div>
                </div>

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
                <p>{isLoading ? 'Loading feedback...' : 'Select a feedback message to view details'}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
