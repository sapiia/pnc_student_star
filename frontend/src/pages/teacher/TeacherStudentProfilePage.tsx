import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, AlertCircle, MessageSquare, X, ClipboardList, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import RadarChart from '../../components/ui/RadarChart';
import { cn } from '../../lib/utils';
import { getRealtimeSocket } from '../../lib/realtime';
import { 
  API_BASE_URL, 
  toDisplayName, 
  resolveAvatarUrl,
  DEFAULT_AVATAR,
  formatShortDate,
  parseStudentReplyNotification,
  getTeacherIdFromStorage,
  getHiddenFeedbackIds,
  setHiddenFeedbackIds
} from '../../lib/teacher/utils';
import type { ConversationMessage } from '../../lib/teacher/types';

const RADAR_COLORS = [
  { key: 'score', name: 'Performance', color: '#5d5fef', fill: '#5d5fef' },
];

const CRITERIA_COLOR_STYLES = [
  { iconBg: 'bg-blue-100', iconText: 'text-blue-600', detailText: 'text-blue-600', stars: 'text-blue-500', hover: 'hover:border-blue-300' },
  { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', detailText: 'text-emerald-600', stars: 'text-emerald-500', hover: 'hover:border-emerald-300' },
  { iconBg: 'bg-amber-100', iconText: 'text-amber-600', detailText: 'text-amber-600', stars: 'text-amber-500', hover: 'hover:border-amber-300' },
  { iconBg: 'bg-rose-100', iconText: 'text-rose-600', detailText: 'text-rose-600', stars: 'text-rose-500', hover: 'hover:border-rose-300' },
  { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', detailText: 'text-cyan-600', stars: 'text-cyan-500', hover: 'hover:border-cyan-300' },
] as const;

export default function TeacherStudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [latestEval, setLatestEval] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCriterion, setActiveCriterion] = useState<any>(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [teacherId, setTeacherId] = useState<number | null>(null);

  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [teacherNotifications, setTeacherNotifications] = useState<any[]>([]);
  const [hiddenFeedbackIds, setHiddenFeedbackIdsState] = useState<number[]>([]);
  const [pendingDeleteFeedbackId, setPendingDeleteFeedbackId] = useState<number | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [teacherMaxFeedbackCharacters, setTeacherMaxFeedbackCharacters] = useState(1000);
  const [showEvaluationList, setShowEvaluationList] = useState(false);
  const [globalRatingScale, setGlobalRatingScale] = useState(5);
  const [globalCriteria, setGlobalCriteria] = useState<any[]>([]);
  const [evaluationFeedback, setEvaluationFeedback] = useState<any[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  // Initialize teacher ID
  useEffect(() => {
    const tid = getTeacherIdFromStorage();
    setTeacherId(tid);
  }, []);

  // Load hidden feedback IDs
  useEffect(() => {
    if (!teacherId) return;
    const ids = getHiddenFeedbackIds(teacherId);
    setHiddenFeedbackIdsState(ids);
  }, [teacherId]);

  // Save hidden feedback IDs
  useEffect(() => {
    if (!teacherId) return;
    setHiddenFeedbackIds(teacherId, hiddenFeedbackIds);
  }, [hiddenFeedbackIds, teacherId]);

  const loadTeacherFeedbacks = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/teacher/${teacherId}`);
      const data = await response.json();
      if (response.ok) setFeedbackHistory(Array.isArray(data) ? data : []);
    } catch {}
  }, [teacherId]);

  const loadTeacherNotifications = useCallback(async () => {
    if (!teacherId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${teacherId}`);
      const data = await response.json();
      if (response.ok) setTeacherNotifications(Array.isArray(data) ? data : []);
    } catch {}
  }, [teacherId]);

  // Fetch feedback for a specific evaluation
  const fetchEvaluationFeedback = useCallback(async (evaluationId: number) => {
    if (!student?.id) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/student/${student.id}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        return data.filter((fb: any) => Number(fb.evaluation_id) === evaluationId);
      }
    } catch {}
    return [];
  }, [student?.id]);

  // Fetch student data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userRes, evalRes, setRes, criteriaRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${id}`),
          fetch(`${API_BASE_URL}/evaluations/user/${id}`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`)
        ]);
        
        if (userRes.ok) setStudent(await userRes.json());
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          const sorted = Array.isArray(evalData) ? evalData.sort((a,b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()) : [];
          setEvaluations(sorted);
          setLatestEval(sorted[0] || null);
        }
        if (setRes.ok) {
          const setData = await setRes.json();
          const limit = Number(setData?.value);
          if (limit > 0) setTeacherMaxFeedbackCharacters(limit);
        }
        if (criteriaRes.ok) {
          const criteriaData = await criteriaRes.json();
          const scale = Math.max(1, Number(criteriaData?.ratingScale || 5));
          setGlobalRatingScale(scale);
          setGlobalCriteria(Array.isArray(criteriaData?.criteria) ? criteriaData.criteria : []);
        }
      } catch (err) {
        console.error("Failed to load student profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const renderTopBar = () => (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center shrink-0 z-10">
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors mr-4"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
          <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">{studentName}</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Profile & Performance</p>
        </div>
      </div>
    </header>
  );

  // Load feedback and notifications
  useEffect(() => {
    if (teacherId) {
      void loadTeacherFeedbacks();
      void loadTeacherNotifications();
    }
  }, [teacherId, loadTeacherFeedbacks, loadTeacherNotifications]);

  // Realtime subscriptions
  useEffect(() => {
    if (!teacherId) return;
    const socket = getRealtimeSocket();
    const handleUpdate = () => { void loadTeacherFeedbacks(); void loadTeacherNotifications(); };
    socket.emit('feedback:subscribe', { teacherId });
    socket.emit('notification:subscribe', { userId: teacherId });
    socket.on('feedback:created', handleUpdate);
    socket.on('feedback:updated', handleUpdate);
    socket.on('feedback:deleted', handleUpdate);
    socket.on('notification:created', handleUpdate);
    socket.on('notification:read', handleUpdate);
    return () => {
      socket.emit('feedback:unsubscribe', { teacherId });
      socket.emit('notification:unsubscribe', { userId: teacherId });
      socket.off('feedback:created', handleUpdate);
      socket.off('feedback:updated', handleUpdate);
      socket.off('feedback:deleted', handleUpdate);
      socket.off('notification:created', handleUpdate);
      socket.off('notification:read', handleUpdate);
    };
  }, [teacherId, loadTeacherFeedbacks, loadTeacherNotifications]);

  // Computed data
  const visibleStudentFeedbackHistory = useMemo(() => {
    if (!student || !teacherId) return [];
    return feedbackHistory.filter((fb: any) =>
      Number(fb.teacher_id) === teacherId &&
      Number(fb.student_id) === student.id &&
      !hiddenFeedbackIds.includes(Number(fb.id))
    );
  }, [feedbackHistory, hiddenFeedbackIds, student, teacherId]);

  const studentReplyHistory = useMemo(() => {
    if (!student) return [];
    return teacherNotifications
      .map(parseStudentReplyNotification)
      .filter((item: any) => Boolean(item) && Number(item.studentId) === Number(student.id))
      .sort((a: any, b: any) => new Date(String(a.createdAt || '')).getTime() - new Date(String(b.createdAt || '')).getTime());
  }, [student, teacherNotifications]);

  const conversationMessages = useMemo<ConversationMessage[]>(() => {
    const tMsgs: ConversationMessage[] = visibleStudentFeedbackHistory.map((fb: any) => ({
      id: `teacher-${fb.id}`, source: 'teacher', text: String(fb.comment || '').trim(), createdAt: fb.created_at, feedbackId: Number(fb.id)
    }));
    const sMsgs: ConversationMessage[] = studentReplyHistory.map((rep: any) => ({
      id: `student-${rep.notificationId}`, source: 'student', text: String(rep.message || '').trim(), createdAt: rep.createdAt, feedbackId: Number(rep.feedbackId), notificationId: Number(rep.notificationId), isRead: rep.isRead
    }));
    return [...tMsgs, ...sMsgs].sort((a, b) => new Date(String(a.createdAt || '')).getTime() - new Date(String(b.createdAt || '')).getTime());
  }, [visibleStudentFeedbackHistory, studentReplyHistory]);

  // Handlers
  const handleSubmitFeedback = async () => {
    if (!teacherId || !student) return;
    const trimmedFeedback = feedbackDraft.trim();
    if (!trimmedFeedback) {
      setFeedbackError('Feedback cannot be empty.');
      return;
    }
    const replyPrefix = replyToMessage
      ? `Replying to ${replyToMessage.source === 'student' ? 'student' : 'teacher'} (${formatShortDate(replyToMessage.createdAt)}): "${replyToMessage.text.slice(0, 120)}"\n\n`
      : '';
    const finalComment = `${replyPrefix}${trimmedFeedback}`;

    if (finalComment.length > teacherMaxFeedbackCharacters) {
      setFeedbackError(`Feedback must be ${teacherMaxFeedbackCharacters} characters or fewer.`);
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, student_id: student.id, evaluation_id: latestEval?.id || null, comment: finalComment })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to save feedback');
      setFeedbackSuccess('Feedback submitted successfully!');
      setFeedbackDraft('');
      setReplyToMessage(null);
      void loadTeacherFeedbacks();
    } catch (err: any) {
      setFeedbackError(err.message || 'Error saving feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleHideFeedbackForMe = (feedbackId: number) => {
    setHiddenFeedbackIdsState((prev) => prev.includes(feedbackId) ? prev : [feedbackId, ...prev]);
  };

  const confirmDeleteFeedbackForEveryone = async () => {
    if (!pendingDeleteFeedbackId) return;
    try {
      await fetch(`${API_BASE_URL}/feedbacks/${pendingDeleteFeedbackId}`, { method: 'DELETE' });
      setFeedbackHistory((prev) => prev.filter((fb: any) => Number(fb.id) !== pendingDeleteFeedbackId));
      setHiddenFeedbackIdsState((prev) => prev.filter((id) => id !== pendingDeleteFeedbackId));
      setPendingDeleteFeedbackId(null);
    } catch {}
  };

  const handleMarkReplyAsRead = async (notificationId: number) => {
    try {
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, { method: 'PUT' });
      setTeacherNotifications((current) => current.map((n: any) => Number(n.id) === notificationId ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const radarData = useMemo(() => {
    const activeGlobal = globalCriteria.filter((c: any) => String(c.status).toLowerCase() === 'active');
    if (!activeGlobal.length) return { data: [], maxValue: globalRatingScale };
    
    // Use selected evaluation if available, otherwise use latest
    const evalToShow = selectedEvaluation || latestEval;
    
    const data = activeGlobal.map((criterion: any, index: number) => {
      const response = (evalToShow?.responses || []).find((r: any) => 
        String(r.criterion_id || r.criterion_key || '').trim() === String(criterion.id || '').trim() ||
        String(r.criterion_name || '').trim().toLowerCase() === String(criterion.name || '').trim().toLowerCase()
      );
      return { subject: String(criterion.name || `Criterion ${index + 1}`), score: response ? Math.max(0, Number(response.star_value || 0)) : 0 };
    });
    return { data, maxValue: globalRatingScale };
  }, [latestEval, selectedEvaluation, globalCriteria, globalRatingScale]);

  const selectedCriteria = useMemo(() => {
    const activeGlobal = globalCriteria.filter((c: any) => String(c.status).toLowerCase() === 'active');
    // Use selected evaluation if available, otherwise use latest
    const evalToShow = selectedEvaluation || latestEval;
    
    return activeGlobal.map((criterion: any, index: number) => {
      const response = (evalToShow?.responses || []).find((r: any) => 
        String(r.criterion_id || r.criterion_key || '').trim() === String(criterion.id || '').trim() ||
        String(r.criterion_name || '').trim().toLowerCase() === String(criterion.name || '').trim().toLowerCase()
      );
      return {
        criterion_key: criterion.id || criterion.name || `criterion-${index}`,
        criterion_name: criterion.name || `Criterion ${index + 1}`,
        criterion_icon: criterion.icon || 'Star',
        criterion_color: criterion.color || CRITERIA_COLOR_STYLES[index % CRITERIA_COLOR_STYLES.length].iconText.replace('text-', ''),
        star_value: response ? Math.max(0, Number(response.star_value || 0)) : 0,
        reflection: response ? String(response.reflection || '').trim() : '',
        tip_snapshot: response ? String(response.tip_snapshot || '').trim() : '',
      };
    });
  }, [globalCriteria, latestEval, selectedEvaluation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
        <TeacherSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!student) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
        <TeacherSidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Student Not Found</h2>
          <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold hover:underline">Go Back</button>
        </main>
      </div>
    );
  }

  const studentName = toDisplayName(student);
  const avatarUrl = resolveAvatarUrl(student.profile_image, DEFAULT_AVATAR);
  const studentIdDisplay = student.student_id || student.resolved_student_id || `STU-${student.id}`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        {renderTopBar()}

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1000px] mx-auto space-y-8">
            {/* Student Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
              <div className="size-32 rounded-3xl overflow-hidden shrink-0 border-4 border-white shadow-lg z-10">
                <img src={avatarUrl} alt={studentName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 z-10 mt-2">
                <h2 className="text-3xl font-black text-slate-900 mb-2">{studentName}</h2>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-lg border border-slate-200">
                    {student.class || 'Unassigned Class'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider rounded-lg border border-emerald-200">
                    {student.generation ? `Gen ${student.generation}` : 'Unknown Generation'}
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-lg border border-primary/20">
                    {student.gender || 'Unknown Gender'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 tracking-wider">ID: {studentIdDisplay}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/teacher/messages', { state: { selectedContactId: Number(student.id) } })}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Student
                  </button>
                  <button
                    onClick={() => setShowEvaluationList(!showEvaluationList)}
                    className="px-6 py-3 bg-white border-2 border-primary text-primary hover:bg-primary/5 font-bold text-sm rounded-xl transition-all flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    {showEvaluationList ? 'Hide Evaluation List' : 'Evaluation List'}
                    {showEvaluationList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            </div>

            {/* Inline Evaluation List Section */}
            {showEvaluationList && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Evaluation History</h3>
                      <p className="text-xs text-slate-500">{evaluations.length} evaluation(s) found</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {evaluations.length > 0 ? (
                    <div className="space-y-4">
                      {evaluations.map((evalItem: any, index: number) => (
                        <motion.button
                          key={evalItem.id}
                          type="button"
                          onClick={async () => {
                            // Set selected evaluation to update radar and criteria breakdown
                            setSelectedEvaluation(evalItem);
                            // Fetch feedback for this evaluation
                            const feedback = await fetchEvaluationFeedback(evalItem.id);
                            setEvaluationFeedback(feedback);
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all shadow-sm ${
                            selectedEvaluation?.id === evalItem.id 
                              ? 'border-primary bg-primary/5 shadow-lg' 
                              : 'border-slate-200 bg-white hover:border-primary/40 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                <ClipboardList className="w-6 h-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-black text-slate-900 truncate">{evalItem.period || `Evaluation #${evaluations.length - index}`}</p>
                                <div className="flex items-center gap-2 mt-1 text-slate-500">
                                  <span className="text-xs">
                                    Finished: {new Date(evalItem.submitted_at || evalItem.created_at).toLocaleDateString('en-US', { 
                                      year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-medium text-slate-600">
                                    {evalItem.criteria_count || (evalItem.responses?.length || 0)} criteria
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: globalRatingScale }).map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(evalItem.average_score) ? 'text-primary fill-primary' : 'text-slate-200'}`} />
                                ))}
                              </div>
                              <span className="text-lg font-black text-slate-900">{Number(evalItem.average_score).toFixed(1)}</span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-500">No evaluations found</p>
                      <p className="text-xs text-slate-400 mt-1">This student hasn't submitted any evaluations yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-8">
                {/* Radar Chart */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Performance Radar</h3>
                  <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 p-2 overflow-hidden flex items-center justify-center">
                    {radarData.data.length > 0 ? (
                      <RadarChart data={radarData.data} dataKeys={RADAR_COLORS} maxValue={radarData.maxValue} />
                    ) : (
                      <div className="text-center p-6 text-sm font-bold text-slate-400">No evaluation data available.</div>
                    )}
                  </div>
                  {selectedEvaluation && (
                    <div className="mt-6 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {selectedEvaluation.period || 'Selected'} Average Score
                      </p>
                      <div className="text-3xl font-black text-slate-900">
                        {Number(selectedEvaluation.average_score).toFixed(1)} <span className="text-sm text-slate-400">/ {selectedEvaluation.rating_scale || globalRatingScale}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(selectedEvaluation.submitted_at || selectedEvaluation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Evaluation-Specific Feedback Section */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h4 className="text-sm font-bold text-slate-900">{selectedEvaluation?.period || 'Evaluation'} Feedback</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{evaluationFeedback.length} messages</span>
                  </div>
                  <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    {evaluationFeedback.length > 0 ? evaluationFeedback.map((feedback: any) => (
                      <div key={feedback.id} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          {feedback.teacher_profile_image ? (
                            <img src={feedback.teacher_profile_image} alt={feedback.teacher_name || 'Teacher'} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-900">{feedback.teacher_name || 'Teacher'}</p>
                            {Number(feedback.teacher_id) === teacherId && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">You</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{new Date(feedback.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-700 mt-1">{feedback.comment}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-sm text-slate-400">No feedback for this evaluation yet</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Criteria */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Criteria Breakdown</h3>
                    {selectedEvaluation ? (
                      <span className="text-xs font-bold text-primary">{selectedEvaluation.period} • {new Date(selectedEvaluation.submitted_at || selectedEvaluation.created_at).toLocaleDateString()}</span>
                    ) : latestEval ? (
                      <span className="text-xs font-bold text-slate-400">From {new Date(latestEval.created_at).toLocaleDateString()}</span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCriteria.length > 0 ? selectedCriteria.map((response: any, index: number) => {
                      const style = CRITERIA_COLOR_STYLES[index % CRITERIA_COLOR_STYLES.length];
                      return (
                        <button key={response.criterion_key}
                          onClick={() => setActiveCriterion({ key: response.criterion_key, label: response.criterion_name || response.criterion_key, icon: response.criterion_icon || 'Star', score: response.star_value, reflection: response.reflection, tip: response.tip_snapshot })}
                          className={cn('p-5 rounded-2xl border border-slate-100 bg-slate-50 text-left hover:bg-white transition-all', style.hover)}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 truncate">{response.criterion_name || response.criterion_key}</p>
                            <span className={cn('text-[9px] font-black uppercase tracking-widest', style.detailText)}>Details</span>
                          </div>
                          <div className={cn('flex gap-1 mb-4', style.stars)}>
                            {Array.from({ length: globalRatingScale }).map((_, i) => (
                              <Star key={i} className={cn('w-4 h-4 fill-current', i >= Math.floor(response.star_value) && 'text-slate-200 fill-slate-200')} />
                            ))}
                          </div>
                          {response.reflection && (
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reflection</p>
                              <p className="text-sm text-slate-700 italic border-l-2 border-slate-200 pl-3 line-clamp-2">"{response.reflection}"</p>
                            </div>
                          )}
                        </button>
                      );
                    }) : (
                      <div className="col-span-full p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                        Student has not completed any evaluations yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Criterion Detail Modal */}
      <AnimatePresence>
        {activeCriterion && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveCriterion(null)} className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col z-[100]">
              <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                    <Star className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary">Criterion Detail</p>
                    <h3 className="text-2xl font-black text-slate-900">{activeCriterion.label}</h3>
                    <div className="flex items-center gap-3 text-primary">
                      {Array.from({ length: globalRatingScale }).map((_, i) => (
                        <Star key={i} className={cn('w-4 h-4 fill-current', i >= Math.floor(activeCriterion.score) && 'text-slate-200 fill-slate-200')} />
                      ))}
                      <span className="text-sm font-black text-slate-900">{activeCriterion.score}/{globalRatingScale} Stars</span>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveCriterion(null)} className="size-10 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-2">Assigned Tip</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700">{activeCriterion.tip || 'No admin tip was saved for this criterion.'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Student Reflection</p>
                  <p className="text-sm font-medium leading-relaxed text-slate-700 italic">{activeCriterion.reflection ? `"${activeCriterion.reflection}"` : 'No reflection provided.'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

