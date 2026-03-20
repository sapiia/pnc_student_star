import { 
  Settings, 
  Shield, 
  Database, 
  Bell, 
  Globe, 
  Lock, 
  Save, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Activity,
  Trash2,
  Star,
  Minus,
  Home,
  Briefcase,
  Heart,
  Brain,
  CreditCard,
  Wrench,
  Users2,
  TrendingUp,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import { cn } from '../../lib/utils';
import React, { useEffect, useRef, useState } from 'react';

const INITIAL_CRITERIA = [
  { id: 'CRIT-001', icon: 'ð ', name: 'Living', description: 'Focus on your living environment, cleanliness of housing, and overall organization of daily chores.', status: 'Active' },
  { id: 'CRIT-002', icon: 'ð', name: 'Job and Study', description: 'Reflect on your academic performance, attendance, internship dedication, and continuous learning efforts.', status: 'Active' },
  { id: 'CRIT-003', icon: 'ð¥', name: 'Human and Support', description: 'Interpersonal relationships, teamwork skills, and the strength of your social support network.', status: 'Active' },
  { id: 'CRIT-004', icon: 'ð', name: 'Health', description: 'Assessment of physical health, sleep patterns, nutrition, and exercise.', status: 'Active' },
  { id: 'CRIT-005', icon: 'ð', name: 'Your Feeling', description: 'Self-reflection on happiness, stress management, and emotional stability.', status: 'Active' },
  { id: 'CRIT-006', icon: 'âï¸', name: 'Choice and Behavior', description: 'Evaluating the maturity of your decisions and the responsibility taken for personal actions.', status: 'Active' },
  { id: 'CRIT-007', icon: 'ðµ', name: 'Money and Payment', description: 'Financial management, budgeting skills, and meeting financial obligations.', status: 'Active' },
  { id: 'CRIT-008', icon: 'ð ï¸', name: 'Life Skill', description: 'Practical skills including time management, problem-solving, and self-sufficiency.', status: 'Active' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const CRITERION_ICON_OPTIONS = [
  { value: 'Sparkles', label: 'Sparkles' },
  { value: 'Home', label: 'Home' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Users2', label: 'Users' },
  { value: 'TrendingUp', label: 'Trending' },
  { value: 'Heart', label: 'Heart' },
  { value: 'Brain', label: 'Brain' },
  { value: 'CreditCard', label: 'Card' },
  { value: 'Wrench', label: 'Wrench' },
  { value: 'GraduationCap', label: 'Graduation' },
  { value: 'BookOpen', label: 'Book' },
  { value: 'Laptop', label: 'Laptop' },
  { value: 'MessageCircle', label: 'Message' },
  { value: 'Smile', label: 'Smile' },
  { value: 'ShieldCheck', label: 'Shield' },
  { value: 'Target', label: 'Target' },
  { value: 'Compass', label: 'Compass' },
  { value: 'Lightbulb', label: 'Idea' },
  { value: 'Rocket', label: 'Rocket' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Handshake', label: 'Handshake' },
  { value: 'Coins', label: 'Coins' },
  { value: 'Trophy', label: 'Trophy' },
  { value: 'Palette', label: 'Palette' }
];

type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  profile_image?: string | null;
};

type CriterionSetting = {
  id: string;
  icon: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft';
  starDescriptions: string[];
};

type RolePermissionSettings = {
  studentCanStartEvaluation: boolean;
  studentCanEditAfterSubmit: boolean;
  studentCanViewTeacherFeedback: boolean;
  studentCanViewOwnHistory: boolean;
  studentCanRequestDeadlineExtension: boolean;
  studentCanAccessHelpCenter: boolean;
  studentReceivesReminderNotifications: boolean;
  studentMaxEvaluationsPerCycle: number;
  studentMaxReflectionCharacters: number;
  teacherCanReviewEvaluations: boolean;
  teacherCanEditSubmittedFeedback: boolean;
  teacherCanViewStudentProfiles: boolean;
  teacherCanScheduleMeetings: boolean;
  teacherCanSendBulkMessages: boolean;
  teacherCanExportReports: boolean;
  teacherCanManageEvaluationDeadlines: boolean;
  teacherMaxAssignedStudents: number;
  teacherMaxFeedbackCharacters: number;
};

type RDIEndpoint = {
  id: string;
  alias: string;
  url: string;
  username: string;
  password?: string;
};

const DEFAULT_ROLE_PERMISSIONS: RolePermissionSettings = {
  studentCanStartEvaluation: true,
  studentCanEditAfterSubmit: false,
  studentCanViewTeacherFeedback: true,
  studentCanViewOwnHistory: true,
  studentCanRequestDeadlineExtension: true,
  studentCanAccessHelpCenter: true,
  studentReceivesReminderNotifications: true,
  studentMaxEvaluationsPerCycle: 1,
  studentMaxReflectionCharacters: 500,
  teacherCanReviewEvaluations: true,
  teacherCanEditSubmittedFeedback: true,
  teacherCanViewStudentProfiles: true,
  teacherCanScheduleMeetings: true,
  teacherCanSendBulkMessages: false,
  teacherCanExportReports: true,
  teacherCanManageEvaluationDeadlines: false,
  teacherMaxAssignedStudents: 30,
  teacherMaxFeedbackCharacters: 1000
};

const buildDefaultStarDescriptions = (criterionName: string) =>
  Array.from({ length: 5 }, (_, index) => {
    const star = index + 1;
    if (star === 1) return `Needs significant support in ${criterionName.toLowerCase()}, with frequent gaps that require close coaching.`;
    if (star === 2) return `Shows early progress in ${criterionName.toLowerCase()}, but performance is still inconsistent and needs regular follow-up.`;
    if (star === 3) return `Meets the expected baseline in ${criterionName.toLowerCase()} with steady but still improvable habits.`;
    if (star === 4) return `Performs well in ${criterionName.toLowerCase()} and demonstrates reliable, above-average behavior in most situations.`;
    return `Consistently excels in ${criterionName.toLowerCase()} and models outstanding behavior with minimal guidance.`;
  });

const createCriterionSetting = (
  id: string,
  icon: string,
  name: string,
  description: string,
  status: 'Active' | 'Draft' = 'Active'
): CriterionSetting => ({
  id,
  icon,
  name,
  description,
  status,
  starDescriptions: buildDefaultStarDescriptions(name),
});

const normalizeStarDescriptions = (criterionName: string, starDescriptions: string[], ratingScale: number) =>
  Array.from({ length: ratingScale }, (_, index) => {
    const existing = starDescriptions[index];
    if (typeof existing === 'string' && existing.trim()) return existing;

    const star = index + 1;
    if (star === 1) return `Needs significant support in ${criterionName.toLowerCase()}, with frequent gaps that require close coaching.`;
    if (star === 2) return `Shows early progress in ${criterionName.toLowerCase()}, but performance is still inconsistent and needs regular follow-up.`;
    if (star === 3) return `Meets the expected baseline in ${criterionName.toLowerCase()} with steady but still improvable habits.`;
    if (star === 4) return `Performs well in ${criterionName.toLowerCase()} and demonstrates reliable, above-average behavior in most situations.`;
    if (star === 5) return `Consistently excels in ${criterionName.toLowerCase()} and models outstanding behavior with minimal guidance.`;
    return `Defines the expectations for ${star} stars in ${criterionName.toLowerCase()} with clear performance guidance.`;
  });

const DEFAULT_CRITERIA_SETTINGS: CriterionSetting[] = [
  ...INITIAL_CRITERIA.map((criterion, index) =>
    createCriterionSetting(
      criterion.id,
      index === 0 ? 'Home' :
      index === 1 ? 'Briefcase' :
      index === 2 ? 'Users2' :
      index === 3 ? 'Heart' :
      index === 4 ? 'Smile' :
      index === 5 ? 'Brain' :
      index === 6 ? 'CreditCard' :
      'Wrench',
      criterion.name,
      criterion.description
    )
  ),
  createCriterionSetting(
    'CRIT-009',
    'MessageCircle',
    'Communication',
    'Clarity of expression, active listening, respectful dialogue, and constructive participation.'
  )
];

const normalizeCriterionSettings = (criteria: unknown, ratingScale: number): CriterionSetting[] => {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    return DEFAULT_CRITERIA_SETTINGS.map((criterion) => ({
      ...criterion,
      starDescriptions: normalizeStarDescriptions(criterion.name, criterion.starDescriptions, ratingScale)
    }));
  }

  return criteria.map((criterion, index) => {
    const source = (criterion || {}) as Partial<CriterionSetting>;
    const fallback = DEFAULT_CRITERIA_SETTINGS[index];
    const name = String(source.name || fallback?.name || `Criterion ${index + 1}`).trim();

    return {
      id: String(source.id || fallback?.id || `CRIT-${String(index + 1).padStart(3, '0')}`),
      icon: String(source.icon || fallback?.icon || 'Sparkles').trim() || 'Sparkles',
      name,
      description: String(source.description || fallback?.description || '').trim(),
      status: source.status === 'Draft' ? 'Draft' : 'Active',
      starDescriptions: normalizeStarDescriptions(
        name,
        Array.isArray(source.starDescriptions) ? source.starDescriptions : fallback?.starDescriptions || [],
        ratingScale
      )
    };
  });
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'profile' | 'infrastructure'>('system');
  const [criteriaList, setCriteriaList] = useState<CriterionSetting[]>(() => DEFAULT_CRITERIA_SETTINGS);
  const [ratingScale, setRatingScale] = useState(5);
  const [evaluationIntervalDays, setEvaluationIntervalDays] = useState(90);
  const [notificationRetentionDays, setNotificationRetentionDays] = useState(7);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionSettings>(DEFAULT_ROLE_PERMISSIONS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rdiEndpoints, setRdiEndpoints] = useState<RDIEndpoint[]>([]);
  const [showAddRDIModal, setShowAddRDIModal] = useState(false);
  const [newRDI, setNewRDI] = useState<Omit<RDIEndpoint, 'id'>>({ alias: '', url: '', username: 'default', password: '' });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [newCritStarDescriptions, setNewCritStarDescriptions] = useState<string[]>(buildDefaultStarDescriptions('criterion'));
  const [criterionPendingDelete, setCriterionPendingDelete] = useState<CriterionSetting | null>(null);
  const [newCrit, setNewCrit] = useState({ name: '', icon: 'Sparkles', description: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [photoJustUploaded, setPhotoJustUploaded] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roleLabel: 'System Administrator',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg'
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const filteredCriterionIconOptions = CRITERION_ICON_OPTIONS.filter((option) => {
    const query = iconSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return option.label.toLowerCase().includes(query) || option.value.toLowerCase().includes(query);
  });

  const splitNameParts = (fullName = '') => {
    const cleaned = fullName.trim().replace(/\s+/g, ' ');
    if (!cleaned) return { firstName: '', lastName: '' };
    const parts = cleaned.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  };

  const getCriterionIconStyle = (criterionName: string, iconName?: string) => {
    const normalizedName = criterionName.trim().toLowerCase();
    const fallbackToken =
      normalizedName === 'living' ? 'Home' :
      normalizedName === 'job and study' ? 'Briefcase' :
      normalizedName === 'human and support' ? 'Users2' :
      normalizedName === 'health' ? 'TrendingUp' :
      normalizedName === 'your feeling' ? 'Heart' :
      normalizedName === 'choice and behavior' ? 'Brain' :
      normalizedName === 'money and payment' ? 'CreditCard' :
      normalizedName === 'life skill' ? 'Wrench' :
      'Sparkles';
    const normalizedIcon = (iconName || '').trim();
    const iconToken = normalizedIcon && normalizedIcon in LucideIcons ? normalizedIcon : fallbackToken;
    const palette = [
      'bg-amber-50 text-amber-600 ring-1 ring-amber-100 shadow-sm shadow-amber-100/80',
      'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-sm shadow-indigo-100/80',
      'bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 shadow-sm shadow-cyan-100/80',
      'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm shadow-emerald-100/80',
      'bg-rose-50 text-rose-600 ring-1 ring-rose-100 shadow-sm shadow-rose-100/80',
      'bg-violet-50 text-violet-600 ring-1 ring-violet-100 shadow-sm shadow-violet-100/80',
      'bg-lime-50 text-lime-700 ring-1 ring-lime-100 shadow-sm shadow-lime-100/80',
      'bg-orange-50 text-orange-600 ring-1 ring-orange-100 shadow-sm shadow-orange-100/80',
      'bg-sky-50 text-sky-600 ring-1 ring-sky-100 shadow-sm shadow-sky-100/80',
      'bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-100 shadow-sm shadow-fuchsia-100/80'
    ];
    const IconComponent = (LucideIcons as Record<string, LucideIcon>)[iconToken] || Sparkles;
    const paletteIndex = iconToken.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;

    return {
      icon: <IconComponent className="w-5 h-5" />,
      className: palette[paletteIndex]
    };
  };

  const intervalInMonths = evaluationIntervalDays / 30;
  const formattedIntervalMonths = Number.isInteger(intervalInMonths)
    ? `${intervalInMonths} month${intervalInMonths === 1 ? '' : 's'}`
    : `${intervalInMonths.toFixed(1)} months`;

  const parseBooleanSetting = (value: unknown, fallback: boolean) => {
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
    }
    if (typeof value === 'boolean') return value;
    return fallback;
  };

  const parseNumberSetting = (value: unknown, fallback: number, min: number, max: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  };

  const getAuthUserFromStorage = (): AuthUser | null => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const id = Number(parsed?.id);
      if (!Number.isInteger(id) || id <= 0) return null;
      return {
        id,
        name: parsed?.name,
        email: parsed?.email,
        role: parsed?.role,
        profile_image: parsed?.profile_image || null
      };
    } catch {
      return null;
    }
  };

  const toRoleLabel = (role = '') => {
    const normalized = role.toString().trim().toLowerCase();
    if (normalized === 'admin') return 'System Administrator';
    if (normalized === 'teacher') return 'Teacher';
    return 'Student';
  };

  useEffect(() => {
    const localUser = getAuthUserFromStorage();
    setAuthUser(localUser);
  }, []);

  useEffect(() => {
    const loadCriteriaConfig = async () => {
      setIsLoadingCriteria(true);

      try {
        const [criteriaResponse, intervalResponse, notificationRetentionResponse, studentStartResponse, studentEditResponse, studentFeedbackResponse, studentHistoryResponse, studentExtensionResponse, studentHelpResponse, studentReminderResponse, studentMaxResponse, studentReflectionMaxResponse, teacherReviewResponse, teacherEditResponse, teacherProfileResponse, teacherMeetingResponse, teacherBulkMessageResponse, teacherExportResponse, teacherDeadlineResponse, teacherMaxResponse, teacherFeedbackMaxResponse, rdiResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
          fetch(`${API_BASE_URL}/settings/key/notification_auto_delete_days`),
          fetch(`${API_BASE_URL}/settings/key/student_can_start_evaluation`),
          fetch(`${API_BASE_URL}/settings/key/student_can_edit_after_submit`),
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`),
          fetch(`${API_BASE_URL}/settings/key/student_can_view_own_history`),
          fetch(`${API_BASE_URL}/settings/key/student_can_request_deadline_extension`),
          fetch(`${API_BASE_URL}/settings/key/student_can_access_help_center`),
          fetch(`${API_BASE_URL}/settings/key/student_receives_reminder_notifications`),
          fetch(`${API_BASE_URL}/settings/key/student_max_evaluations_per_cycle`),
          fetch(`${API_BASE_URL}/settings/key/student_max_reflection_characters`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_review_evaluations`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_edit_submitted_feedback`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_view_student_profiles`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_schedule_meetings`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_send_bulk_messages`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_export_reports`),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_manage_evaluation_deadlines`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_assigned_students`),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`),
          fetch(`${API_BASE_URL}/settings/key/rdi_endpoints`)
        ]);

        let data: Record<string, unknown> = {};
        let intervalData: Record<string, unknown> = {};
        let notificationRetentionData: Record<string, unknown> = {};
        let studentStartData: Record<string, unknown> = {};
        let studentEditData: Record<string, unknown> = {};
        let studentFeedbackData: Record<string, unknown> = {};
        let studentHistoryData: Record<string, unknown> = {};
        let studentExtensionData: Record<string, unknown> = {};
        let studentHelpData: Record<string, unknown> = {};
        let studentReminderData: Record<string, unknown> = {};
        let studentMaxData: Record<string, unknown> = {};
        let studentReflectionMaxData: Record<string, unknown> = {};
        let teacherReviewData: Record<string, unknown> = {};
        let teacherEditData: Record<string, unknown> = {};
        let teacherProfileData: Record<string, unknown> = {};
        let teacherMeetingData: Record<string, unknown> = {};
        let teacherBulkMessageData: Record<string, unknown> = {};
        let teacherExportData: Record<string, unknown> = {};
        let teacherDeadlineData: Record<string, unknown> = {};
        let teacherMaxData: Record<string, unknown> = {};
        let teacherFeedbackMaxData: Record<string, unknown> = {};
        let rdiData: Record<string, unknown> = {};
        try {
          data = await criteriaResponse.json();
        } catch {
          data = {};
        }
        try {
          intervalData = await intervalResponse.json();
        } catch {
          intervalData = {};
        }
        try {
          notificationRetentionData = await notificationRetentionResponse.json();
        } catch {
          notificationRetentionData = {};
        }
        try {
          studentStartData = await studentStartResponse.json();
        } catch {
          studentStartData = {};
        }
        try {
          studentEditData = await studentEditResponse.json();
        } catch {
          studentEditData = {};
        }
        try {
          studentFeedbackData = await studentFeedbackResponse.json();
        } catch {
          studentFeedbackData = {};
        }
        try {
          studentHistoryData = await studentHistoryResponse.json();
        } catch {
          studentHistoryData = {};
        }
        try {
          studentExtensionData = await studentExtensionResponse.json();
        } catch {
          studentExtensionData = {};
        }
        try {
          studentHelpData = await studentHelpResponse.json();
        } catch {
          studentHelpData = {};
        }
        try {
          studentReminderData = await studentReminderResponse.json();
        } catch {
          studentReminderData = {};
        }
        try {
          studentMaxData = await studentMaxResponse.json();
        } catch {
          studentMaxData = {};
        }
        try {
          studentReflectionMaxData = await studentReflectionMaxResponse.json();
        } catch {
          studentReflectionMaxData = {};
        }
        try {
          teacherReviewData = await teacherReviewResponse.json();
        } catch {
          teacherReviewData = {};
        }
        try {
          teacherEditData = await teacherEditResponse.json();
        } catch {
          teacherEditData = {};
        }
        try {
          teacherProfileData = await teacherProfileResponse.json();
        } catch {
          teacherProfileData = {};
        }
        try {
          teacherMeetingData = await teacherMeetingResponse.json();
        } catch {
          teacherMeetingData = {};
        }
        try {
          teacherBulkMessageData = await teacherBulkMessageResponse.json();
        } catch {
          teacherBulkMessageData = {};
        }
        try {
          teacherExportData = await teacherExportResponse.json();
        } catch {
          teacherExportData = {};
        }
        try {
          teacherDeadlineData = await teacherDeadlineResponse.json();
        } catch {
          teacherDeadlineData = {};
        }
        try {
          teacherMaxData = await teacherMaxResponse.json();
        } catch {
          teacherMaxData = {};
        }
        try {
          teacherFeedbackMaxData = await teacherFeedbackMaxResponse.json();
        } catch {
          teacherFeedbackMaxData = {};
        }
        try {
          rdiData = await rdiResponse.json();
        } catch {
          rdiData = {};
        }

        if (!criteriaResponse.ok) {
          throw new Error((data.error as string) || 'Failed to load criteria configuration.');
        }

        const nextRatingScale = Math.max(1, Number(data.ratingScale || 5));
        setRatingScale(nextRatingScale);
        setCriteriaList(normalizeCriterionSettings(data.criteria, nextRatingScale));
        if (intervalResponse.ok) {
          setEvaluationIntervalDays(Math.min(365, Math.max(30, Number(intervalData.value || 90))));
        } else {
          setEvaluationIntervalDays(90);
        }
        if (notificationRetentionResponse.ok) {
          setNotificationRetentionDays(parseNumberSetting(notificationRetentionData.value, 7, 7, 365));
        } else {
          setNotificationRetentionDays(7);
        }
        setRolePermissions({
          studentCanStartEvaluation: studentStartResponse.ok
            ? parseBooleanSetting(studentStartData.value, DEFAULT_ROLE_PERMISSIONS.studentCanStartEvaluation)
            : DEFAULT_ROLE_PERMISSIONS.studentCanStartEvaluation,
          studentCanEditAfterSubmit: studentEditResponse.ok
            ? parseBooleanSetting(studentEditData.value, DEFAULT_ROLE_PERMISSIONS.studentCanEditAfterSubmit)
            : DEFAULT_ROLE_PERMISSIONS.studentCanEditAfterSubmit,
          studentCanViewTeacherFeedback: studentFeedbackResponse.ok
            ? parseBooleanSetting(studentFeedbackData.value, DEFAULT_ROLE_PERMISSIONS.studentCanViewTeacherFeedback)
            : DEFAULT_ROLE_PERMISSIONS.studentCanViewTeacherFeedback,
          studentCanViewOwnHistory: studentHistoryResponse.ok
            ? parseBooleanSetting(studentHistoryData.value, DEFAULT_ROLE_PERMISSIONS.studentCanViewOwnHistory)
            : DEFAULT_ROLE_PERMISSIONS.studentCanViewOwnHistory,
          studentCanRequestDeadlineExtension: studentExtensionResponse.ok
            ? parseBooleanSetting(studentExtensionData.value, DEFAULT_ROLE_PERMISSIONS.studentCanRequestDeadlineExtension)
            : DEFAULT_ROLE_PERMISSIONS.studentCanRequestDeadlineExtension,
          studentCanAccessHelpCenter: studentHelpResponse.ok
            ? parseBooleanSetting(studentHelpData.value, DEFAULT_ROLE_PERMISSIONS.studentCanAccessHelpCenter)
            : DEFAULT_ROLE_PERMISSIONS.studentCanAccessHelpCenter,
          studentReceivesReminderNotifications: studentReminderResponse.ok
            ? parseBooleanSetting(studentReminderData.value, DEFAULT_ROLE_PERMISSIONS.studentReceivesReminderNotifications)
            : DEFAULT_ROLE_PERMISSIONS.studentReceivesReminderNotifications,
          studentMaxEvaluationsPerCycle: studentMaxResponse.ok
            ? parseNumberSetting(studentMaxData.value, DEFAULT_ROLE_PERMISSIONS.studentMaxEvaluationsPerCycle, 1, 12)
            : DEFAULT_ROLE_PERMISSIONS.studentMaxEvaluationsPerCycle,
          studentMaxReflectionCharacters: studentReflectionMaxResponse.ok
            ? parseNumberSetting(studentReflectionMaxData.value, DEFAULT_ROLE_PERMISSIONS.studentMaxReflectionCharacters, 100, 5000)
            : DEFAULT_ROLE_PERMISSIONS.studentMaxReflectionCharacters,
          teacherCanReviewEvaluations: teacherReviewResponse.ok
            ? parseBooleanSetting(teacherReviewData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanReviewEvaluations)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanReviewEvaluations,
          teacherCanEditSubmittedFeedback: teacherEditResponse.ok
            ? parseBooleanSetting(teacherEditData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanEditSubmittedFeedback)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanEditSubmittedFeedback,
          teacherCanViewStudentProfiles: teacherProfileResponse.ok
            ? parseBooleanSetting(teacherProfileData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanViewStudentProfiles)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanViewStudentProfiles,
          teacherCanScheduleMeetings: teacherMeetingResponse.ok
            ? parseBooleanSetting(teacherMeetingData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanScheduleMeetings)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanScheduleMeetings,
          teacherCanSendBulkMessages: teacherBulkMessageResponse.ok
            ? parseBooleanSetting(teacherBulkMessageData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanSendBulkMessages)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanSendBulkMessages,
          teacherCanExportReports: teacherExportResponse.ok
            ? parseBooleanSetting(teacherExportData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanExportReports)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanExportReports,
          teacherCanManageEvaluationDeadlines: teacherDeadlineResponse.ok
            ? parseBooleanSetting(teacherDeadlineData.value, DEFAULT_ROLE_PERMISSIONS.teacherCanManageEvaluationDeadlines)
            : DEFAULT_ROLE_PERMISSIONS.teacherCanManageEvaluationDeadlines,
          teacherMaxAssignedStudents: teacherMaxResponse.ok
            ? parseNumberSetting(teacherMaxData.value, DEFAULT_ROLE_PERMISSIONS.teacherMaxAssignedStudents, 0, 200)
            : DEFAULT_ROLE_PERMISSIONS.teacherMaxAssignedStudents,
          teacherMaxFeedbackCharacters: teacherFeedbackMaxResponse.ok
            ? parseNumberSetting(teacherFeedbackMaxData.value, DEFAULT_ROLE_PERMISSIONS.teacherMaxFeedbackCharacters, 100, 10000)
            : DEFAULT_ROLE_PERMISSIONS.teacherMaxFeedbackCharacters
        });

        if (rdiResponse.ok && rdiData.value) {
          try {
            const parsed = JSON.parse(String(rdiData.value));
            if (Array.isArray(parsed)) setRdiEndpoints(parsed);
          } catch {
            setRdiEndpoints([]);
          }
        } else {
          setRdiEndpoints([]);
        }
      } catch (error) {
        setCriteriaList(normalizeCriterionSettings(DEFAULT_CRITERIA_SETTINGS, ratingScale));
        setEvaluationIntervalDays(90);
        setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load criteria configuration.');
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    loadCriteriaConfig();
  }, []);

  useEffect(() => {
    if (!showAddModal) return;
    if (newCrit.icon && newCrit.icon in LucideIcons) return;
    setNewCrit((prev) => ({ ...prev, icon: 'Sparkles' }));
  }, [showAddModal, newCrit.icon]);

  useEffect(() => {
    setCriteriaList((prev) =>
      prev.map((criterion) => ({
        ...criterion,
        starDescriptions: normalizeStarDescriptions(criterion.name, criterion.starDescriptions, ratingScale)
      }))
    );
    setNewCritStarDescriptions((prev) => normalizeStarDescriptions(newCrit.name || 'criterion', prev, ratingScale));
  }, [ratingScale, newCrit.name]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.id) return;
      if (photoJustUploaded) return; // Skip loading if photo was just uploaded
      setErrorMessage('');

      try {
        const response = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile`);
        let data: Record<string, unknown> = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }
        if (!response.ok) {
          throw new Error((data.error as string) || 'Failed to load profile.');
        }

        const savedPhoto = String(data.profile_image || authUser.profile_image || '').trim()
          || localStorage.getItem(`profile_photo_${authUser.id}`)
          || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg';
        const resolvedFirstName = String(data.first_name || '').trim();
        const resolvedLastName = String(data.last_name || '').trim();
        const fallbackName = splitNameParts(String(data.name || authUser.name || ''));
        setProfileForm((prev) => ({
          ...prev,
          firstName: resolvedFirstName || fallbackName.firstName,
          lastName: resolvedLastName || fallbackName.lastName,
          email: String(data.email || authUser.email || ''),
          roleLabel: toRoleLabel(String(data.role || authUser.role || 'admin')),
          department: String(data.department || ''),
          photoUrl: savedPhoto
        }));
      } catch (error) {
        const fallbackPhoto = String(authUser.profile_image || '').trim()
          || localStorage.getItem(`profile_photo_${authUser.id}`)
          || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg';
        const fallbackName = splitNameParts(authUser.name || '');
        setProfileForm((prev) => ({
          ...prev,
          firstName: fallbackName.firstName,
          lastName: fallbackName.lastName,
          email: authUser.email || '',
          roleLabel: toRoleLabel(authUser.role || 'admin'),
          photoUrl: fallbackPhoto
        }));
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load profile.');
      }
    };

    loadProfile();
  }, [authUser, photoJustUploaded]);

  const openAddRDIModal = () => {
    setNewRDI({ alias: '', url: '', username: 'default', password: '' });
    setTestResult(null);
    setShowAddRDIModal(true);
  };

  const closeAddRDIModal = () => setShowAddRDIModal(false);

  const handleAddRDIEndpoint = () => {
    if (!newRDI.alias || !newRDI.url) return;
    const id = `RDI-${Date.now()}`;
    setRdiEndpoints((prev) => [...prev, { ...newRDI, id }]);
    closeAddRDIModal();
  };

  const deleteRDIEndpoint = (id: string) => {
    setRdiEndpoints((prev) => prev.filter((ep) => ep.id !== id));
  };

  const handleTestRDIConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/settings/test-rdi-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newRDI.url,
          username: newRDI.username,
          password: newRDI.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Network error or server unavailable' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (activeTab === 'system') {
      setIsSaving(true);
      try {
        const [criteriaResponse, intervalResponse, notificationRetentionResponse, studentStartSaveResponse, studentEditSaveResponse, studentFeedbackSaveResponse, studentHistorySaveResponse, studentExtensionSaveResponse, studentHelpSaveResponse, studentReminderSaveResponse, studentMaxSaveResponse, studentReflectionMaxSaveResponse, teacherReviewSaveResponse, teacherEditSaveResponse, teacherProfileSaveResponse, teacherMeetingSaveResponse, teacherBulkMessageSaveResponse, teacherExportSaveResponse, teacherDeadlineSaveResponse, teacherMaxSaveResponse, teacherFeedbackMaxSaveResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/settings/evaluation-criteria`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ratingScale,
              criteria: criteriaList.map((criterion, index) => ({
                id: criterion.id,
                name: criterion.name.trim(),
                icon: criterion.icon,
                description: criterion.description.trim(),
                status: criterion.status,
                displayOrder: index + 1,
                starDescriptions: normalizeStarDescriptions(
                  criterion.name,
                  criterion.starDescriptions,
                  ratingScale
                ).map((description) => description.trim())
              }))
            })
          }),
          fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              value: String(evaluationIntervalDays)
            })
          }),
          fetch(`${API_BASE_URL}/settings/key/notification_auto_delete_days`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              value: String(notificationRetentionDays)
            })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_start_evaluation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanStartEvaluation) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_edit_after_submit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanEditAfterSubmit) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_view_teacher_feedback`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanViewTeacherFeedback) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_view_own_history`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanViewOwnHistory) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_request_deadline_extension`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanRequestDeadlineExtension) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_can_access_help_center`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentCanAccessHelpCenter) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_receives_reminder_notifications`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentReceivesReminderNotifications) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_max_evaluations_per_cycle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentMaxEvaluationsPerCycle) })
          }),
          fetch(`${API_BASE_URL}/settings/key/student_max_reflection_characters`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.studentMaxReflectionCharacters) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_review_evaluations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanReviewEvaluations) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_edit_submitted_feedback`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanEditSubmittedFeedback) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_view_student_profiles`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanViewStudentProfiles) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_schedule_meetings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanScheduleMeetings) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_send_bulk_messages`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanSendBulkMessages) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_export_reports`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanExportReports) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_can_manage_evaluation_deadlines`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherCanManageEvaluationDeadlines) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_assigned_students`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherMaxAssignedStudents) })
          }),
          fetch(`${API_BASE_URL}/settings/key/teacher_max_feedback_characters`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: String(rolePermissions.teacherMaxFeedbackCharacters) })
          })
        ]);

        let data: Record<string, unknown> = {};
        let intervalData: Record<string, unknown> = {};
        let notificationRetentionData: Record<string, unknown> = {};
        let studentStartSaveData: Record<string, unknown> = {};
        let studentEditSaveData: Record<string, unknown> = {};
        let studentFeedbackSaveData: Record<string, unknown> = {};
        let studentHistorySaveData: Record<string, unknown> = {};
        let studentExtensionSaveData: Record<string, unknown> = {};
        let studentHelpSaveData: Record<string, unknown> = {};
        let studentReminderSaveData: Record<string, unknown> = {};
        let studentMaxSaveData: Record<string, unknown> = {};
        let studentReflectionMaxSaveData: Record<string, unknown> = {};
        let teacherReviewSaveData: Record<string, unknown> = {};
        let teacherEditSaveData: Record<string, unknown> = {};
        let teacherProfileSaveData: Record<string, unknown> = {};
        let teacherMeetingSaveData: Record<string, unknown> = {};
        let teacherBulkMessageSaveData: Record<string, unknown> = {};
        let teacherExportSaveData: Record<string, unknown> = {};
        let teacherDeadlineSaveData: Record<string, unknown> = {};
        let teacherMaxSaveData: Record<string, unknown> = {};
        let teacherFeedbackMaxSaveData: Record<string, unknown> = {};
        try {
          data = await criteriaResponse.json();
        } catch {
          data = {};
        }
        try {
          intervalData = await intervalResponse.json();
        } catch {
          intervalData = {};
        }
        try {
          notificationRetentionData = await notificationRetentionResponse.json();
        } catch {
          notificationRetentionData = {};
        }
        try {
          studentStartSaveData = await studentStartSaveResponse.json();
        } catch {
          studentStartSaveData = {};
        }
        try {
          studentEditSaveData = await studentEditSaveResponse.json();
        } catch {
          studentEditSaveData = {};
        }
        try {
          studentFeedbackSaveData = await studentFeedbackSaveResponse.json();
        } catch {
          studentFeedbackSaveData = {};
        }
        try {
          studentHistorySaveData = await studentHistorySaveResponse.json();
        } catch {
          studentHistorySaveData = {};
        }
        try {
          studentExtensionSaveData = await studentExtensionSaveResponse.json();
        } catch {
          studentExtensionSaveData = {};
        }
        try {
          studentHelpSaveData = await studentHelpSaveResponse.json();
        } catch {
          studentHelpSaveData = {};
        }
        try {
          studentReminderSaveData = await studentReminderSaveResponse.json();
        } catch {
          studentReminderSaveData = {};
        }
        try {
          studentMaxSaveData = await studentMaxSaveResponse.json();
        } catch {
          studentMaxSaveData = {};
        }
        try {
          studentReflectionMaxSaveData = await studentReflectionMaxSaveResponse.json();
        } catch {
          studentReflectionMaxSaveData = {};
        }
        try {
          teacherReviewSaveData = await teacherReviewSaveResponse.json();
        } catch {
          teacherReviewSaveData = {};
        }
        try {
          teacherEditSaveData = await teacherEditSaveResponse.json();
        } catch {
          teacherEditSaveData = {};
        }
        try {
          teacherProfileSaveData = await teacherProfileSaveResponse.json();
        } catch {
          teacherProfileSaveData = {};
        }
        try {
          teacherMeetingSaveData = await teacherMeetingSaveResponse.json();
        } catch {
          teacherMeetingSaveData = {};
        }
        try {
          teacherBulkMessageSaveData = await teacherBulkMessageSaveResponse.json();
        } catch {
          teacherBulkMessageSaveData = {};
        }
        try {
          teacherExportSaveData = await teacherExportSaveResponse.json();
        } catch {
          teacherExportSaveData = {};
        }
        try {
          teacherDeadlineSaveData = await teacherDeadlineSaveResponse.json();
        } catch {
          teacherDeadlineSaveData = {};
        }
        try {
          teacherMaxSaveData = await teacherMaxSaveResponse.json();
        } catch {
          teacherMaxSaveData = {};
        }
        try {
          teacherFeedbackMaxSaveData = await teacherFeedbackMaxSaveResponse.json();
        } catch {
          teacherFeedbackMaxSaveData = {};
        }

        if (!criteriaResponse.ok) {
          throw new Error((data.error as string) || 'Failed to save criteria configuration.');
        }
        if (!intervalResponse.ok) {
          throw new Error((intervalData.error as string) || 'Failed to save evaluation interval.');
        }
        if (!notificationRetentionResponse.ok) {
          throw new Error((notificationRetentionData.error as string) || 'Failed to save notification retention.');
        }
        if (!studentStartSaveResponse.ok) {
          throw new Error((studentStartSaveData.error as string) || 'Failed to save student permissions.');
        }
        if (!studentEditSaveResponse.ok) {
          throw new Error((studentEditSaveData.error as string) || 'Failed to save student edit permissions.');
        }
        if (!studentFeedbackSaveResponse.ok) {
          throw new Error((studentFeedbackSaveData.error as string) || 'Failed to save student feedback permissions.');
        }
        if (!studentHistorySaveResponse.ok) {
          throw new Error((studentHistorySaveData.error as string) || 'Failed to save student history permissions.');
        }
        if (!studentExtensionSaveResponse.ok) {
          throw new Error((studentExtensionSaveData.error as string) || 'Failed to save deadline extension permissions.');
        }
        if (!studentHelpSaveResponse.ok) {
          throw new Error((studentHelpSaveData.error as string) || 'Failed to save help center permissions.');
        }
        if (!studentReminderSaveResponse.ok) {
          throw new Error((studentReminderSaveData.error as string) || 'Failed to save student reminder permissions.');
        }
        if (!studentMaxSaveResponse.ok) {
          throw new Error((studentMaxSaveData.error as string) || 'Failed to save student evaluation limit.');
        }
        if (!studentReflectionMaxSaveResponse.ok) {
          throw new Error((studentReflectionMaxSaveData.error as string) || 'Failed to save student reflection limit.');
        }
        if (!teacherReviewSaveResponse.ok) {
          throw new Error((teacherReviewSaveData.error as string) || 'Failed to save teacher review permissions.');
        }
        if (!teacherEditSaveResponse.ok) {
          throw new Error((teacherEditSaveData.error as string) || 'Failed to save teacher feedback permissions.');
        }
        if (!teacherProfileSaveResponse.ok) {
          throw new Error((teacherProfileSaveData.error as string) || 'Failed to save teacher profile permissions.');
        }
        if (!teacherMeetingSaveResponse.ok) {
          throw new Error((teacherMeetingSaveData.error as string) || 'Failed to save teacher meeting permissions.');
        }
        if (!teacherBulkMessageSaveResponse.ok) {
          throw new Error((teacherBulkMessageSaveData.error as string) || 'Failed to save teacher bulk messaging permissions.');
        }
        if (!teacherExportSaveResponse.ok) {
          throw new Error((teacherExportSaveData.error as string) || 'Failed to save teacher export permissions.');
        }
        if (!teacherDeadlineSaveResponse.ok) {
          throw new Error((teacherDeadlineSaveData.error as string) || 'Failed to save teacher deadline permissions.');
        }
        if (!teacherMaxSaveResponse.ok) {
          throw new Error((teacherMaxSaveData.error as string) || 'Failed to save teacher assignment limit.');
        }
        if (!teacherFeedbackMaxSaveResponse.ok) {
          throw new Error((teacherFeedbackMaxSaveData.error as string) || 'Failed to save teacher feedback limit.');
        }

        const nextRatingScale = Math.max(1, Number(data.ratingScale || ratingScale));
        setRatingScale(nextRatingScale);
        setCriteriaList(normalizeCriterionSettings(data.criteria, nextRatingScale));
        setSuccessMessage('Criteria, interval, and role permissions saved successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Notify all students that settings have been updated
        console.log('📢 Broadcasting settings update to all students');
        window.dispatchEvent(new Event('student-settings-updated'));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save criteria configuration.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (activeTab === 'infrastructure') {
      setIsSaving(true);
      try {
        const response = await fetch(`${API_BASE_URL}/settings/key/rdi_endpoints`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: JSON.stringify(rdiEndpoints) })
        });
        if (!response.ok) throw new Error('Failed to save RDI endpoints.');
        setSuccessMessage('Infrastructure settings saved successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to save RDI endpoints.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!authUser?.id) {
      setErrorMessage('You must login first to edit profile.');
      return;
    }

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profileForm.email.trim().toLowerCase();
    const department = profileForm.department.trim();
    const shouldChangePassword = Boolean(
      profileForm.currentPassword.trim() ||
      profileForm.newPassword.trim() ||
      profileForm.confirmPassword.trim()
    );

    if (!firstName) {
      setErrorMessage('First name is required.');
      return;
    }
    if (!lastName) {
      setErrorMessage('Last name is required.');
      return;
    }
    if (!email) {
      setErrorMessage('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Invalid email format.');
      return;
    }
    if (shouldChangePassword) {
      if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
        setErrorMessage('Please fill current, new, and confirm password fields.');
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          name: fullName,
          email,
          department
        })
      });
      let profileData: Record<string, unknown> = {};
      try {
        profileData = await profileResponse.json();
      } catch {
        profileData = {};
      }
      if (!profileResponse.ok) {
        throw new Error((profileData.error as string) || 'Failed to update profile.');
      }

      if (shouldChangePassword) {
        const passwordResponse = await fetch(`${API_BASE_URL}/users/${authUser.id}/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: profileForm.currentPassword,
            new_password: profileForm.newPassword
          })
        });
        let passwordData: Record<string, unknown> = {};
        try {
          passwordData = await passwordResponse.json();
        } catch {
          passwordData = {};
        }
        if (!passwordResponse.ok) {
          throw new Error((passwordData.error as string) || 'Failed to change password.');
        }
      }

      const userPayload = (profileData.user as Record<string, unknown>) || {};
      const updatedUser: AuthUser = {
        id: authUser.id,
        name: String(userPayload.name || fullName),
        email: String(userPayload.email || email),
        role: String(userPayload.role || authUser.role || 'admin'),
        profile_image: String(userPayload.profile_image || authUser.profile_image || profileForm.photoUrl || '').trim() || null
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setAuthUser(updatedUser);
      window.dispatchEvent(new Event('profile-updated'));

      setProfileForm((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: updatedUser.email || '',
        roleLabel: toRoleLabel(updatedUser.role || 'admin'),
        department,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      setSuccessMessage(shouldChangePassword ? 'Profile and password updated successfully!' : 'Profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetCriterionForm = () => {
    setEditingCriterionId(null);
    setNewCrit({ name: '', icon: 'Sparkles', description: '' });
    setNewCritStarDescriptions(buildDefaultStarDescriptions('criterion'));
    setIconSearchQuery('');
  };

  const openAddCriterionModal = () => {
    resetCriterionForm();
    setShowAddModal(true);
  };

  const openEditCriterionModal = (criterion: CriterionSetting) => {
    setEditingCriterionId(criterion.id);
    setNewCrit({
      name: criterion.name,
      icon: criterion.icon,
      description: criterion.description
    });
    setNewCritStarDescriptions(
      normalizeStarDescriptions(criterion.name, criterion.starDescriptions, ratingScale)
    );
    setIconSearchQuery('');
    setShowAddModal(true);
  };

  const handleSaveCriterion = () => {
    if (!newCrit.name.trim()) return;

    const criterionPayload: CriterionSetting = {
      id: editingCriterionId || `CRIT-${String(criteriaList.length + 1).padStart(3, '0')}`,
      name: newCrit.name.trim(),
      icon: newCrit.icon || 'Sparkles',
      description: newCrit.description.trim(),
      status: 'Active',
      starDescriptions: newCritStarDescriptions.map((description) => description.trim())
    };

    if (editingCriterionId) {
      setCriteriaList(criteriaList.map((criterion) => (
        criterion.id === editingCriterionId ? criterionPayload : criterion
      )));
    } else {
      setCriteriaList([...criteriaList, criterionPayload]);
    }

    resetCriterionForm();
    setShowAddModal(false);
  };

  const handleAddCriterion = () => {
    handleSaveCriterion();
  };

  const handleDeleteCriterion = (criterion: CriterionSetting) => {
    setCriterionPendingDelete(criterion);
  };

  const confirmDeleteCriterion = () => {
    if (!criterionPendingDelete) return;
    setCriteriaList(criteriaList.filter((criterion) => criterion.id !== criterionPendingDelete.id));
    setCriterionPendingDelete(null);
  };

  const handlePhotoPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('image', file);

    fetch(`${API_BASE_URL}/users/${authUser.id}/profile-image`, {
      method: 'PATCH',
      body: formData
    })
      .then(async (response) => {
        const rawText = await response.text();
        let data: Record<string, unknown> = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = { error: rawText || 'Server returned an invalid response.' };
        }
        if (!response.ok) {
          throw new Error(String(data.error || 'Failed to update profile image.'));
        }

        const user = (data.user as Record<string, unknown>) || {};
        const updatedPhoto = String(user.profile_image || '').trim();
        if (!updatedPhoto) {
          throw new Error('Profile image was not returned by server.');
        }

        const updatedUser: AuthUser = {
          ...(authUser || { id: 0 }),
          name: String(user.name || authUser?.name || ''),
          email: String(user.email || authUser?.email || ''),
          role: String(user.role || authUser?.role || 'admin'),
          profile_image: updatedPhoto
        };
        setAuthUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        localStorage.setItem(`profile_photo_${authUser.id}`, updatedPhoto);
        setProfileForm((prev) => ({ ...prev, photoUrl: updatedPhoto }));
        setPhotoTimestamp(Date.now()); // Update timestamp to force image refresh
        setPhotoJustUploaded(true); // Mark as just uploaded
        window.dispatchEvent(new Event('profile-photo-updated'));
        window.dispatchEvent(new Event('profile-updated'));
        setSuccessMessage('Profile photo updated.');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setPhotoJustUploaded(false); // Reset flag after showing success message
        }, 3000);
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile image.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto relative">
        <AdminMobileNav />
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {criterionPendingDelete && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCriterionPendingDelete(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                <div className="border-b border-slate-100 px-8 py-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Delete Criterion?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                    You are about to remove <span className="font-black text-slate-700">{criterionPendingDelete.name}</span>. This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 bg-slate-50 px-8 py-6">
                  <button
                    onClick={() => setCriterionPendingDelete(null)}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteCriterion}
                    className="flex-1 rounded-2xl bg-rose-500 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <h1 className="text-lg md:text-xl font-black text-slate-900">Settings</h1>
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab('system')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'system' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                System
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'profile' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('infrastructure')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'infrastructure' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Infrastructure
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
          {activeTab === 'system' ? (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900">Evaluation Criteria Management</h2>
                <p className="text-slate-500 font-bold">Manage the core evaluation pillars and descriptive student guidance tips.</p>
                {isLoadingCriteria && (
                  <p className="text-sm font-bold text-primary">Loading saved criteria configuration from database...</p>
                )}
              </div>

              {/* Alert Box */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-4 text-blue-800">
                <div className="size-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-relaxed">
                    You are currently managing <span className="font-black underline">{criteriaList.length} criteria</span>. 
                    The system now supports adding more than 8 or decreasing below 8. 
                    The star-chart visualization will automatically adapt to the number of active criteria.
                  </p>
                </div>
              </div>

              {/* Criteria Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex gap-4">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Active Criteria ({criteriaList.length})</h3>
                  </div>
                  <button 
                    onClick={openAddCriterionModal}
                    className="px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Criterion
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Icon</th>
                        <th className="px-6 py-4">Criterion Name</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Stars</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence initial={false}>
                        {criteriaList.map((item) => {
                          const criterionIcon = getCriterionIconStyle(item.name, item.icon);
                          return (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            whileHover={{
                              scale: 1.012,
                              boxShadow: '0 18px 35px -24px rgba(15, 23, 42, 0.22)'
                            }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className="group bg-white transition-all duration-300 ease-out hover:bg-slate-50/80"
                          >
                            <td className="px-6 py-4">
                              <div
                                className={cn(
                                  "size-11 rounded-2xl flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110",
                                  criterionIcon.className
                                )}
                              >
                                {criterionIcon.icon}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="transition-transform duration-300 ease-out group-hover:scale-[1.01] origin-left">
                                <p className="text-sm font-black text-slate-900">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-md">
                              <div className="space-y-1 transition-transform duration-300 ease-out group-hover:scale-[1.005] origin-left">
                                <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-1 transition-all">
                                  {item.description}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                  {item.starDescriptions.length} descriptions ready
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 min-w-[180px]">
                              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2">
                                <div className="mb-2 flex flex-wrap gap-1.5">
                                  {Array.from({ length: ratingScale }).map((_, index) => (
                                    <div
                                      key={index}
                                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm shadow-amber-100/70"
                                    >
                                      <Star className="h-4 w-4 fill-amber-500" />
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                                  {ratingScale}-star scale
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditCriterionModal(item)}
                                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCriterion(item)}
                                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {criteriaList.length} criteria</p>
                </div>
              </div>

              {/* System Configuration Section */}
              <div className="space-y-6 pt-8">
                <h3 className="text-2xl font-black text-slate-900">System Configuration</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Rating Scale Settings */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-slate-900">Rating Scale Configuration</h4>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Max Rating Points (Stars)</label>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Define how many stars/points are available for each criterion.</p>
                          </div>
                          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <button 
                              onClick={() => setRatingScale(Math.max(1, ratingScale - 1))}
                              className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-black text-primary w-8 text-center">{ratingScale}</span>
                            <button 
                              onClick={() => setRatingScale(Math.min(10, ratingScale + 1))}
                              className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                          {Array.from({ length: ratingScale }).map((_, i) => (
                            <div key={i} className="size-8 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-500">
                              <Star className="w-4 h-4 fill-amber-500" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-4 italic">
                          Note: Changing the rating scale will normalize existing scores to the new scale.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Interval */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-slate-900">Evaluation Interval</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Interval (Days)</label>
                          <span className="text-xs font-black text-primary">{evaluationIntervalDays} days</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mb-4">
                          Defines how often students must evaluate themselves. Default is 90 days, and admin can reduce or extend it.
                        </p>
                        <input
                          type="range"
                          min={30}
                          max={365}
                          step={15}
                          value={evaluationIntervalDays}
                          onChange={(e) => setEvaluationIntervalDays(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Cycle</p>
                          <p className="text-sm font-bold text-slate-900">{formattedIntervalMonths}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEvaluationIntervalDays((prev) => Math.max(30, prev - 15))}
                            className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min={30}
                            max={365}
                            step={15}
                            value={evaluationIntervalDays}
                            onChange={(e) => {
                              const nextValue = Number(e.target.value);
                              if (Number.isNaN(nextValue)) return;
                              setEvaluationIntervalDays(Math.min(365, Math.max(30, nextValue)));
                            }}
                            className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setEvaluationIntervalDays((prev) => Math.min(365, prev + 15))}
                            className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Allowed range: 30 to 365 days. 90 days equals the default 3-month cycle.
                      </p>
                      <button
                        type="button"
                        onClick={() => setEvaluationIntervalDays(90)}
                        className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80"
                      >
                        Reset To Default 90 Days
                      </button>
                    </div>
                  </div>

                  {/* Notification Retention */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-slate-900">Notification Retention</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Auto-delete After (Days)</label>
                          <span className="text-xs font-black text-primary">{notificationRetentionDays} days</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mb-4">
                          Notifications are automatically removed for all users after this many days. Minimum is 7 days.
                        </p>
                        <input
                          type="range"
                          min={7}
                          max={365}
                          step={7}
                          value={notificationRetentionDays}
                          onChange={(e) => setNotificationRetentionDays(Number(e.target.value))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retention Policy</p>
                          <p className="text-sm font-bold text-slate-900">{notificationRetentionDays} days</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setNotificationRetentionDays((prev) => Math.max(7, prev - 7))}
                            className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min={7}
                            max={365}
                            step={1}
                            value={notificationRetentionDays}
                            onChange={(e) => {
                              const nextValue = Number(e.target.value);
                              if (Number.isNaN(nextValue)) return;
                              setNotificationRetentionDays(Math.min(365, Math.max(7, nextValue)));
                            }}
                            className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setNotificationRetentionDays((prev) => Math.min(365, prev + 7))}
                            className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Allowed range: 7 to 365 days. This applies to all roles (students, teachers, admins).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">Student Permissions</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Set boundaries for student actions</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Allow Students To Start Evaluation</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main access gate for self-evaluation</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanStartEvaluation: !prev.studentCanStartEvaluation }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanStartEvaluation ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanStartEvaluation ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Allow Editing After Submit</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Let students reopen their own submission</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanEditAfterSubmit: !prev.studentCanEditAfterSubmit }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanEditAfterSubmit ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanEditAfterSubmit ? 'Allowed' : 'Locked'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Multiple Evaluations Per Cycle</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow students to evaluate more than once per cycle</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ 
                            ...prev, 
                            studentMaxEvaluationsPerCycle: prev.studentMaxEvaluationsPerCycle === 1 ? 999 : 1 
                          }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentMaxEvaluationsPerCycle > 1 ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentMaxEvaluationsPerCycle > 1 ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">View Teacher Feedback</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control whether mentor comments are visible</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanViewTeacherFeedback: !prev.studentCanViewTeacherFeedback }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanViewTeacherFeedback ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanViewTeacherFeedback ? 'Visible' : 'Hidden'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">View Own Evaluation History</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow students to see past cycles and results</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanViewOwnHistory: !prev.studentCanViewOwnHistory }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanViewOwnHistory ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanViewOwnHistory ? 'Visible' : 'Hidden'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Request Deadline Extension</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Let students ask for extra time before due date</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanRequestDeadlineExtension: !prev.studentCanRequestDeadlineExtension }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanRequestDeadlineExtension ? "bg-violet-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanRequestDeadlineExtension ? 'Allowed' : 'Blocked'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Access Help Center</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keep support resources available or restricted</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentCanAccessHelpCenter: !prev.studentCanAccessHelpCenter }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentCanAccessHelpCenter ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentCanAccessHelpCenter ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Reminder Notifications</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send countdown reminders to students</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, studentReceivesReminderNotifications: !prev.studentReceivesReminderNotifications }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.studentReceivesReminderNotifications ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.studentReceivesReminderNotifications ? 'On' : 'Off'}
                        </button>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">Max Evaluations Per Cycle</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit how many times a student can submit in one cycle</p>
                          </div>
                          <span className="text-lg font-black text-primary">{rolePermissions.studentMaxEvaluationsPerCycle}</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={12}
                          step={1}
                          value={rolePermissions.studentMaxEvaluationsPerCycle}
                          onChange={(e) => setRolePermissions((prev) => ({
                            ...prev,
                            studentMaxEvaluationsPerCycle: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">Max Reflection Characters</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cap the text length for each student reflection</p>
                          </div>
                          <span className="text-lg font-black text-primary">{rolePermissions.studentMaxReflectionCharacters}</span>
                        </div>
                        <input
                          type="range"
                          min={100}
                          max={5000}
                          step={100}
                          value={rolePermissions.studentMaxReflectionCharacters}
                          onChange={(e) => setRolePermissions((prev) => ({
                            ...prev,
                            studentMaxReflectionCharacters: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">Teacher Permissions</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Set review authority and assignment limits</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Review Student Evaluations</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allows teachers to access submitted evaluations</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanReviewEvaluations: !prev.teacherCanReviewEvaluations }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanReviewEvaluations ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanReviewEvaluations ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Edit Submitted Feedback</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controls whether a teacher can revise comments later</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanEditSubmittedFeedback: !prev.teacherCanEditSubmittedFeedback }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanEditSubmittedFeedback ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanEditSubmittedFeedback ? 'Allowed' : 'Locked'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">View Student Profiles</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access identity and profile details of assigned students</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanViewStudentProfiles: !prev.teacherCanViewStudentProfiles }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanViewStudentProfiles ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanViewStudentProfiles ? 'Visible' : 'Restricted'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Schedule Meetings</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow teachers to create mentoring meetings</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanScheduleMeetings: !prev.teacherCanScheduleMeetings }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanScheduleMeetings ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanScheduleMeetings ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Send Bulk Messages</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enable broadcast announcements to assigned students</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanSendBulkMessages: !prev.teacherCanSendBulkMessages }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanSendBulkMessages ? "bg-fuchsia-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanSendBulkMessages ? 'Allowed' : 'Blocked'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Export Reports</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Download student summaries and performance reports</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanExportReports: !prev.teacherCanExportReports }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanExportReports ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanExportReports ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">Manage Evaluation Deadlines</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allow teachers to adjust or reopen evaluation windows</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRolePermissions((prev) => ({ ...prev, teacherCanManageEvaluationDeadlines: !prev.teacherCanManageEvaluationDeadlines }))}
                          className={cn(
                            "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            rolePermissions.teacherCanManageEvaluationDeadlines ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {rolePermissions.teacherCanManageEvaluationDeadlines ? 'Allowed' : 'Blocked'}
                        </button>
                      </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">Max feedback to Students</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Limit unique students a teacher can feedback (0 = unlimited)</p>
                          </div>
                          <span className="text-lg font-black text-primary">
                            {rolePermissions.teacherMaxAssignedStudents === 0 ? 'Unlimited' : rolePermissions.teacherMaxAssignedStudents}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={200}
                          step={1}
                          value={rolePermissions.teacherMaxAssignedStudents}
                          onChange={(e) => setRolePermissions((prev) => ({
                            ...prev,
                            teacherMaxAssignedStudents: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">Max Feedback Characters</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cap the length of teacher feedback comments</p>
                          </div>
                          <span className="text-lg font-black text-primary">{rolePermissions.teacherMaxFeedbackCharacters}</span>
                        </div>
                        <input
                          type="range"
                          min={100}
                          max={10000}
                          step={100}
                          value={rolePermissions.teacherMaxFeedbackCharacters}
                          onChange={(e) => setRolePermissions((prev) => ({
                            ...prev,
                            teacherMaxFeedbackCharacters: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'infrastructure' ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900">Infrastructure Management</h2>
                <p className="text-slate-500 font-bold">Manage Redis Data Integration (RDI) endpoints and external connections.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">RDI Endpoints ({rdiEndpoints.length})</h3>
                  <button 
                    onClick={openAddRDIModal}
                    className="px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                    Add RDI Endpoint
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-4">Alias</th>
                        <th className="px-6 py-4">URL</th>
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rdiEndpoints.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                            No RDI endpoints configured yet.
                          </td>
                        </tr>
                      ) : (
                        rdiEndpoints.map((ep) => (
                          <tr key={ep.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{ep.alias}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{ep.url}</td>
                            <td className="px-6 py-4 text-slate-600 font-medium">{ep.username}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => deleteRDIEndpoint(ep.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900">Personal Profile</h2>
                <p className="text-slate-500 font-bold">Manage your administrative profile and security settings.</p>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 flex flex-col md:flex-row gap-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-32 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner relative group">
                      <img
                        src={profileForm.photoUrl ? `${profileForm.photoUrl}?t=${photoTimestamp}` : 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg'}
                        alt={`${profileForm.firstName} ${profileForm.lastName}`.trim() || 'Admin'}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoPick}
                    />
                    <button onClick={() => photoInputRef.current?.click()} className="text-sm font-bold text-primary hover:underline">Change Photo</button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Role</label>
                      <input type="text" value={profileForm.roleLabel} disabled className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900">Security</h2>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                    <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="????????" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="????????" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="????????" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add Criterion Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              >
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {editingCriterionId ? 'Edit Criterion' : 'Add New Criterion'}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">Set the name, icon, summary, and five star descriptions.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div
                        className={cn(
                          "size-11 rounded-2xl flex items-center justify-center",
                          getCriterionIconStyle(newCrit.name, newCrit.icon).className
                        )}
                      >
                        {getCriterionIconStyle(newCrit.name, newCrit.icon).icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</p>
                        <p className="text-sm font-bold text-slate-900">{newCrit.name || 'New Criterion'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_1.2fr]">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Criterion Name</label>
                        <input 
                          type="text" 
                          value={newCrit.name}
                          onChange={(e) => setNewCrit({ ...newCrit, name: e.target.value })}
                          placeholder="e.g., Communication Skills"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                        <textarea 
                          value={newCrit.description}
                          onChange={(e) => setNewCrit({ ...newCrit, description: e.target.value })}
                          placeholder="Describe what students should reflect on..."
                          className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Star Guidance</p>
                            <p className="text-sm font-bold text-slate-900">Write one paragraph for each of the 5 stars.</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-amber-500 shadow-sm">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star key={index} className="h-4 w-4 fill-amber-500" />
                            ))}
                          </div>
                        </div>
                        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                          {newCritStarDescriptions.map((description, index) => (
                            <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
                              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {index + 1} Star Description
                              </label>
                              <textarea
                                value={description}
                                onChange={(e) => {
                                  const nextDescriptions = [...newCritStarDescriptions];
                                  nextDescriptions[index] = e.target.value;
                                  setNewCritStarDescriptions(nextDescriptions);
                                }}
                                placeholder={`Explain what ${index + 1} star means for ${newCrit.name || 'this criterion'}...`}
                                className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Icon</label>
                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={iconSearchQuery}
                            onChange={(e) => setIconSearchQuery(e.target.value)}
                            placeholder="Search icons..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1">
                          {filteredCriterionIconOptions.map((option) => {
                            const previewIcon = getCriterionIconStyle(option.label, option.value);
                            const isSelected = newCrit.icon === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setNewCrit({ ...newCrit, icon: option.value })}
                                className={cn(
                                  "rounded-xl border p-2 text-center transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                )}
                              >
                                <div className={cn("mx-auto mb-1 size-9 rounded-xl flex items-center justify-center", previewIcon.className)}>
                                  {previewIcon.icon}
                                </div>
                                <p className="text-[10px] font-bold leading-tight text-slate-700">{option.label}</p>
                              </button>
                            );
                          })}
                        </div>
                        {filteredCriterionIconOptions.length === 0 && (
                          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                            No icons match that search.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50 p-6 flex gap-3">
                  <button 
                    onClick={() => {
                      resetCriterionForm();
                      setShowAddModal(false);
                    }}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCriterion}
                    className="flex-1 py-3 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {editingCriterionId ? 'Save Criterion' : 'Add Criterion'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showAddRDIModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeAddRDIModal}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
              >
                <div className="p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900">Add RDI endpoint</h3>
                    <button onClick={closeAddRDIModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                      <LucideIcons.X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <span className="text-rose-500 mr-1">*</span> RDI Alias
                      </label>
                      <input 
                        type="text" 
                        value={newRDI.alias}
                        onChange={(e) => setNewRDI({ ...newRDI, alias: e.target.value })}
                        placeholder="Enter RDI Alias"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <span className="text-rose-500 mr-1">*</span> URL
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                      </label>
                      <input 
                        type="text" 
                        value={newRDI.url}
                        onChange={(e) => setNewRDI({ ...newRDI, url: e.target.value })}
                        placeholder="Enter the RDI host IP as: https://[IP-Address]"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          Username
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                        </label>
                        <input 
                          type="text" 
                          value={newRDI.username}
                          onChange={(e) => setNewRDI({ ...newRDI, username: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          Password
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                        </label>
                        <input 
                          type="password" 
                          value={newRDI.password}
                          onChange={(e) => setNewRDI({ ...newRDI, password: e.target.value })}
                          placeholder="Enter the RDI Redis password"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4">
                    <button 
                      onClick={handleTestRDIConnection}
                      disabled={isTestingConnection || !newRDI.url}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline disabled:text-slate-400 disabled:no-underline"
                    >
                      {isTestingConnection ? (
                        <>
                          <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Activity className="w-4 h-4" />
                          Test Connection
                        </>
                      )}
                    </button>

                    {testResult && (
                      <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 text-sm font-bold",
                        testResult.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex justify-end gap-4">
                    <button 
                      onClick={closeAddRDIModal}
                      className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddRDIEndpoint}
                      disabled={!newRDI.alias || !newRDI.url}
                      className={cn(
                        "px-8 py-3 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20",
                        (!newRDI.alias || !newRDI.url) 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-primary text-white hover:bg-primary/90"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Add Endpoint
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}




