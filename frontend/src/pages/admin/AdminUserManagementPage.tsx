import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Trash2,
  Filter,
  Download,
  UserPlus,
  Upload,
  Power,
  Minus,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';

import { cn } from '../../lib/utils';
import RadarChart from '../../components/ui/RadarChart';
import React, { useEffect, useState, useMemo } from 'react';

type UserRole = 'Student' | 'Teacher' | 'Admin';
type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Deleted';
type StudentGeneration = string;
type StudentMajor = string;
type Gender = 'male' | 'female';

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  group: string;
  status: UserStatus;
  initials: string;
  color: string;
  profileImage?: string;
  studentId?: string;
  generation?: StudentGeneration;
  className?: string;
  major?: StudentMajor;
  gender?: Gender;
};

const formatPeriodLabel = (period: string) => {
  const trimmed = String(period || '').trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  return trimmed || 'Evaluation';
};

const formatEvalDate = (value?: string) => {
  const date = new Date(String(value || '').trim());
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

type BulkInvitedUser = {
  row?: number;
  name: string;
  email: string;
  role: string;
  gender?: string;
  group?: string;
  generation?: string | null;
  className?: string | null;
  major?: string | null;
  studentId?: string | null;
};

type BulkExistingUser = {
  row: number;
  name: string;
  email: string;
};

type BulkValidatedRow = {
  row: number;
  payload: {
    firstName: string;
    lastName?: string;
    email: string;
    gender: string;
    role: string;
    generation?: string | null;
    className?: string | null;
    major?: string | null;
    studentId?: string | null;
  };
};

type ConfirmAction =
  | {
      kind: 'toggle-active';
      user: UserRecord;
      shouldEnable: boolean;
    }
  | {
      kind: 'delete';
      user: UserRecord;
    }
  | {
      kind: 'hard-delete';
      user: UserRecord;
    }
  | {
      kind: 'delete-all';
    }
  | {
      kind: 'disable-all';
    }
  | {
      kind: 'hard-delete-all';
    };

type ApiUser = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  profile_image?: string | null;
  role: string;
  class?: string | null;
  student_id?: string | null;
  resolved_student_id?: string | null;
  is_active?: number | boolean | null;
  is_disable?: number | boolean | null;
  is_deleted?: number | boolean | null;
  is_registered?: number | boolean | null;
  account_status?: string;
  registration_status?: string;
  gender?: string | null;
  generation?: string | null;
  className?: string | null;
  major?: string | null;
};

const defaultNewUser = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'Student' as UserRole,
  generation: '2026' as StudentGeneration,
  major: 'SNA' as StudentMajor,
  className: '',
  studentId: '',
  gender: 'male' as Gender,
  status: 'Active' as UserStatus
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_MAJOR_OPTIONS = ['SNA', 'WEB DEV'];
const DEFAULT_CLASS_OPTIONS = ['WEB A', 'WEB B'];
const USERS_PER_PAGE = 15;

const toDisplayNameFromEmail = (email: string) => {
  const username = email.split('@')[0] || 'User';
  return username
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const mapApiUserToRecord = (apiUser: ApiUser): UserRecord => {
  const roleLower = (apiUser.role || '').toString().toLowerCase();
  const role: UserRole = roleLower === 'teacher' ? 'Teacher' : roleLower === 'admin' ? 'Admin' : 'Student';
  const fullName = [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ').trim();
  const resolvedName = (apiUser.name || '').trim() || fullName || toDisplayNameFromEmail(apiUser.email);
  const initials = resolvedName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-emerald-100 text-emerald-700',
    'bg-indigo-100 text-indigo-700'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const isDeleted = Number(apiUser.is_deleted || 0) === 1;
  const isDisabled = typeof apiUser.is_disable !== 'undefined'
    ? Number(apiUser.is_disable || 0) === 1
    : Number(apiUser.is_active ?? 1) === 0;
  const isPending = typeof apiUser.is_registered !== 'undefined'
    ? Number(apiUser.is_registered || 0) === 0
    : (apiUser.registration_status || '').toString().toLowerCase() === 'pending'
      || (apiUser.account_status || '').toString().toLowerCase() === 'pending';
  const status: UserStatus = isDeleted ? 'Deleted' : isPending ? 'Pending' : isDisabled ? 'Inactive' : 'Active';
  const classText = (apiUser.class || '').toString().trim();
  const group = role === 'Student'
    ? (classText || 'Pending Class Assignment')
    : role === 'Teacher'
      ? 'Teaching Staff'
      : 'Administration';
  const studentId = ((apiUser.student_id || apiUser.resolved_student_id || '') as string).toString().trim() || undefined;

  return {
    id: apiUser.id,
    name: resolvedName,
    email: apiUser.email,
    role,
    group,
    status,
    initials,
    color: randomColor,
    profileImage: String(apiUser.profile_image || '').trim() || 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg',
    studentId,
    gender: apiUser.gender === 'male' || apiUser.gender === 'female' ? apiUser.gender as Gender : undefined,
    generation: apiUser.generation || undefined,
    className: apiUser.class || apiUser.className || undefined,
    major: apiUser.major || undefined
  };
};

export default function AdminUserManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserRecord | null>(null);
  const [profileEvaluations, setProfileEvaluations] = useState<any[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);
  const [isEvaluationListOpen, setIsEvaluationListOpen] = useState(false);
  const [deletingEvaluationId, setDeletingEvaluationId] = useState<number | null>(null);
  const [confirmDeleteEvaluation, setConfirmDeleteEvaluation] = useState<{
    id: number;
    title: string;
    finishedAt: string;
  } | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [editStudentId, setEditStudentId] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [editGender, setEditGender] = useState<Gender | ''>('');
  const [editGeneration, setEditGeneration] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [generationFilter, setGenerationFilter] = useState('All Generations');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isBulkCommitting, setIsBulkCommitting] = useState(false);
  const [bulkValidatedRows, setBulkValidatedRows] = useState<BulkValidatedRow[]>([]);
  const [bulkValidationErrorCount, setBulkValidationErrorCount] = useState(0);
  const [bulkExistingUsers, setBulkExistingUsers] = useState<BulkExistingUser[]>([]);
  const [isInviteFinished, setIsInviteFinished] = useState(false);
  const [newUser, setNewUser] = useState(defaultNewUser);
  const [majorOptions, setMajorOptions] = useState<string[]>(DEFAULT_MAJOR_OPTIONS);
  const [customMajorDraft, setCustomMajorDraft] = useState('');
  // Extract unique class options from student data based on selected generation
  const classOptions = useMemo(() => {
    const students = users.filter(u => u.role === 'Student');
    const filteredByGen = generationFilter === 'All Generations' 
      ? students 
      : students.filter(u => u.generation === generationFilter);
    // Extract class from group string like "Gen 2026 - WEB DEV - Class WEB B" -> "WEB B"
    // Use case-insensitive regex to handle inconsistent capitalization
    const uniqueClasses = Array.from(new Set(
      filteredByGen.map(u => {
        if (!u.group) return null;
        const match = u.group.match(/Class\s+(.+)$/i);
        return match ? match[1].trim() : null;
      }).filter(Boolean)
    ));
    return uniqueClasses.sort();
  }, [users, generationFilter]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDirection, setPageDirection] = useState(0);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [globalCriteria, setGlobalCriteria] = useState<any[]>([]);
  const [globalRatingScale, setGlobalRatingScale] = useState<number>(5);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (!response.ok) {
          setFormError(data.error || 'Failed to load users.');
          return;
        }
        const mapped = Array.isArray(data) ? data.map((item: ApiUser) => mapApiUserToRecord(item)) : [];
        setUsers(mapped);
      } catch {
        setFormError('Failed to load users.');
      }
    };
    
    const loadCriteriaConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/evaluation-criteria`);
        if (response.ok) {
          const data = await response.json();
          setGlobalRatingScale(Math.max(1, Number(data?.ratingScale || 5)));
          setGlobalCriteria(Array.isArray(data?.criteria) ? data.criteria : []);
        }
      } catch (err) {
        console.error("Failed to load global criteria config", err);
      }
    };

    loadUsers();
    loadCriteriaConfig();
  }, []);

  useEffect(() => {
    const state = location.state as { openInvite?: boolean; prefillClass?: string; prefillGen?: string };
    if (state?.openInvite) {
      setIsModalOpen(true);
      const prefillClass = state.prefillClass || '';
      setNewUser(prev => ({
        ...prev,
        className: prefillClass || prev.className,
        generation: state.prefillGen || prev.generation
      }));
      // Clear state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const filteredUsers = users.filter(user => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      (user.studentId?.toLowerCase().includes(normalizedQuery) ?? false);
    const matchesRole = roleFilter === 'All Roles' || `${user.role}s` === roleFilter;
    const matchesGender = genderFilter === 'All Genders' || 
      (genderFilter === 'Male' && user.gender === 'male') ||
      (genderFilter === 'Female' && user.gender === 'female');
    const matchesGeneration = generationFilter === 'All Generations' || 
      (user.role === 'Student' && user.generation === generationFilter);
    const matchesClass = classFilter === 'All Classes' || 
      (user.role === 'Student' && user.group?.toLowerCase().includes(`class ${classFilter}`.toLowerCase()));
    return matchesSearch && matchesRole && matchesGender && matchesGeneration && matchesClass;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );
  const emptyRows = Math.max(0, USERS_PER_PAGE - paginatedUsers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, genderFilter, generationFilter, classFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

  const trimmedEmail = newUser.email.trim().toLowerCase();
  const trimmedFirstName = newUser.firstName.trim();
    const trimmedLastName = newUser.lastName.trim();
    const trimmedClass = newUser.className.trim().toUpperCase();
    const trimmedGeneration = newUser.generation.trim();
    const trimmedMajor = newUser.major.trim();
    const trimmedStudentId = newUser.studentId.trim();

    if (!trimmedEmail) {
      setFormError('Email is required.');
      return;
    }
    if (!trimmedFirstName) {
      setFormError('First name is required.');
      return;
    }

    if (newUser.role === 'Student') {
      const studentIdPattern = /^\d{4}-\d{3}$/;
      if (!trimmedGeneration || !/^\d{4}$/.test(trimmedGeneration)) {
        setFormError('Generation must be a 4-digit year.');
        return;
      }
      if (!trimmedMajor) {
        setFormError('Major is required for student invites.');
        return;
      }
      if (trimmedStudentId && !studentIdPattern.test(trimmedStudentId)) {
        setFormError('Student ID must match format YYYY-XXX (example: 2028-001).');
        return;
      }
      if (trimmedStudentId && !trimmedStudentId.startsWith(`${trimmedGeneration}-`)) {
        setFormError('Student ID year must match selected generation.');
        return;
      }
    }

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      setFormError('Email already exists.');
      return;
    }
    setIsSubmitting(true);

    const resolvedName = `${trimmedFirstName} ${trimmedLastName}`.trim() || toDisplayNameFromEmail(trimmedEmail);
    const initials = resolvedName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const group =
      newUser.role === 'Student'
        ? `Gen ${trimmedGeneration}${trimmedMajor ? ` - ${trimmedMajor}` : ''}${trimmedClass ? ` - Class ${trimmedClass}` : ''}`
        : newUser.role === 'Teacher'
          ? 'Teaching Staff'
          : 'Administration';

    try {
      const roleValue = newUser.role.toLowerCase();
      const response = await fetch(`${API_BASE_URL}/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          lastName: trimmedLastName || undefined,
          name: resolvedName,
          gender: newUser.gender,
          email: trimmedEmail,
          role: roleValue,
          generation: roleValue === 'student' ? trimmedGeneration : undefined,
          major: roleValue === 'student' ? trimmedMajor : undefined,
          className: roleValue === 'student' && trimmedClass ? trimmedClass : undefined,
          studentId: roleValue === 'student' && trimmedStudentId ? trimmedStudentId : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Failed to send invitation email.');
        return;
      }
      const invitedUser: UserRecord = {
        id: Date.now(),
        name: resolvedName,
        email: trimmedEmail,
        role: newUser.role,
        gender: newUser.gender,
        group,
        status: 'Pending',
        initials,
        color: randomColor,
        generation: newUser.role === 'Student' ? trimmedGeneration : undefined,
        major: newUser.role === 'Student' ? trimmedMajor : undefined,
        className: newUser.role === 'Student' && trimmedClass ? trimmedClass : undefined,
        studentId: newUser.role === 'Student' && trimmedStudentId ? trimmedStudentId : undefined
      };

      setUsers([invitedUser, ...users]);
      setIsInviteFinished(true);
      setNewUser(defaultNewUser);
      setSuccessMessage(data.message || 'Invitation email sent successfully.');
      setToastType(data.smtpConfigured === false ? 'warning' : 'success');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setFormError('Failed to send invitation email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewUser = async (user: UserRecord) => {
    setSelectedProfileUser(user);
    setEditStudentId(user.studentId || '');
    setEditClassName(user.group || ''); // Group usually acts as class for students
    setEditGender(user.gender || '');
    setEditGeneration(user.generation || '');
    setIsProfileModalOpen(true);
    setProfileEvaluations([]);
    setSelectedEvaluationId(null);
    setIsEvaluationListOpen(false);
    
    if (user.role === 'Student') {
      try {
        const res = await fetch(`${API_BASE_URL}/evaluations/user/${user.id}`);
        if (res.ok) {
           const json = await res.json();
           const evaluations = Array.isArray(json) ? json : [];
           setProfileEvaluations(evaluations);
           setSelectedEvaluationId(evaluations[0]?.id || null);
        }
      } catch (err) {
        console.error("Failed to load student performance", err);
      }
    }
  };

  const handleUpdateStudentInfo = async () => {
    if (!selectedProfileUser || isProfileSaving) return;
    setIsProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedProfileUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProfileUser.name,
          email: selectedProfileUser.email,
          role: selectedProfileUser.role.toLowerCase(),
          class_name: editClassName,
          student_id: editStudentId,
          gender: editGender || undefined,
          generation: editGeneration || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === selectedProfileUser.id 
            ? { ...u, studentId: editStudentId, group: editClassName, className: editClassName, gender: editGender || undefined, generation: editGeneration || undefined } 
            : u
        ));
        setSuccessMessage('Student details updated.');
        setToastType('success');
        setShowSuccess(true);
        setIsProfileModalOpen(false);
      } else {
        setFormError(data.error || 'Failed to update student info');
      }
    } catch {
      setFormError('Network error while updating.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const openDeleteEvaluationConfirm = (evaluation: any) => {
    setConfirmDeleteEvaluation({
      id: evaluation.id,
      title: `${formatPeriodLabel(evaluation.period)} Evaluation`,
      finishedAt: formatEvalDate(evaluation.submitted_at || evaluation.created_at)
    });
  };

  const handleDeleteEvaluation = async (evaluationId: number) => {
    if (!selectedProfileUser || selectedProfileUser.role !== 'Student') return;
    if (deletingEvaluationId) return;

    setDeletingEvaluationId(evaluationId);
    try {
      const res = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || 'Failed to delete evaluation.');
        return;
      }

      setProfileEvaluations((prev) => {
        const next = prev.filter((item) => item.id !== evaluationId);
        const nextSelected = next[0]?.id || null;
        if (selectedEvaluationId === evaluationId) {
          setSelectedEvaluationId(nextSelected);
        }
        return next;
      });
      setConfirmDeleteEvaluation(null);
    } catch {
      setFormError('Network error while deleting evaluation.');
    } finally {
      setDeletingEvaluationId(null);
    }
  };

  const toggleUserActive = (user: UserRecord) => {
    if (user.status === 'Deleted') return;
    const shouldEnable = user.status !== 'Active';
    setConfirmAction({ kind: 'toggle-active', user, shouldEnable });
  };

  const disableAllUsersAction = () => {
    const activeUsersCount = users.filter((u) => u.status === 'Active' || u.status === 'Pending').length;
    if (activeUsersCount === 0 || isActionSubmitting) return;
    setConfirmAction({ kind: 'disable-all' });
  };

  const hardDeleteUsersAction = () => {
    if (users.length === 0 || isActionSubmitting) return;
    setConfirmAction({ kind: 'hard-delete-all' });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsActionSubmitting(true);
    setFormError('');

    const getResponseData = async (response: Response) => {
      try {
        return await response.json();
      } catch {
        return {};
      }
    };

    try {
      if (confirmAction.kind === 'toggle-active') {
        const { user, shouldEnable } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: shouldEnable })
        });
        const data = await getResponseData(response);
        if (!response.ok) {
          setFormError(data.error || 'Failed to update user status.');
          return;
        }
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: shouldEnable ? 'Active' : 'Inactive' } : u)));
        setSuccessMessage(data.message || 'User status updated.');
        setToastType('success');
      } else if (confirmAction.kind === 'hard-delete') {
        const { user } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${user.id}/hard`, { method: 'DELETE' });
        const data = await getResponseData(response);
        if (!response.ok) {
          setFormError(data.error || 'Failed to permanently delete user.');
          return;
        }
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setSuccessMessage(data.message || 'User permanently removed.');
        setToastType('warning');
      } else if (confirmAction.kind === 'disable-all') {
        const response = await fetch(`${API_BASE_URL}/users/active`, { method: 'PATCH' });
        const data = await getResponseData(response);
        if (!response.ok) {
          setFormError(data.error || 'Failed to disable users.');
          return;
        }
        setUsers((prev) => prev.map((u) => (u.status !== 'Deleted' ? { ...u, status: 'Inactive' } : u)));
        setSuccessMessage(data.message || 'All users disabled.');
        setToastType('warning');
      } else if (confirmAction.kind === 'hard-delete-all') {
        const response = await fetch(`${API_BASE_URL}/users/hard-delete`, { method: 'DELETE' });
        const data = await getResponseData(response);
        if (!response.ok) {
          setFormError(data.error || 'Failed to permanently delete users.');
          return;
        }
        // Remove non-admin users from state
        setUsers((prev) => prev.filter((u) => u.role === 'Admin'));
        setSuccessMessage(data.message || 'Non-admin users permanently deleted.');
        setToastType('warning');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setConfirmAction(null);
    } catch {
      setFormError('Failed to complete the action.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const toUserRecordFromBulkInvite = (invited: BulkInvitedUser): UserRecord => {
    const roleLower = (invited.role || '').toLowerCase();
    const mappedRole: UserRole = roleLower === 'teacher' ? 'Teacher' : roleLower === 'admin' ? 'Admin' : 'Student';
    const resolvedName = invited.name?.trim() || toDisplayNameFromEmail(invited.email);
    const initials = resolvedName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const generation = (invited.generation || '').trim() || undefined;
    const className = invited.className || undefined;
    const major = (invited.major || '').trim() || undefined;
    const group =
      invited.group ||
      (mappedRole === 'Student'
        ? (generation || major || className
            ? `Gen ${generation || 'Unknown'}${major ? ` - ${major}` : ''}${className ? ` - Class ${className}` : ''}`
            : 'Pending Class Assignment')
        : mappedRole === 'Teacher'
          ? 'Teaching Staff'
          : 'Administration');
    const normalizedGender = (invited.gender || '').toLowerCase();

    return {
      id: Date.now() + Math.floor(Math.random() * 10000),
      name: resolvedName,
      email: invited.email,
      role: mappedRole,
      group,
      status: 'Pending',
      initials,
      color: randomColor,
      generation,
      major,
      className,
      studentId: invited.studentId || undefined,
      gender: normalizedGender === 'male' || normalizedGender === 'female' ? normalizedGender : undefined
    };
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormError('');
    setIsBulkImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/users/invite/bulk/validate`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || 'Failed to import Excel file.');
        return;
      }

      const failedCount = Number(data?.summary?.failedCount || 0);
      const validatedRows = Array.isArray(data?.validRows) ? data.validRows : [];

      setBulkValidationErrorCount(failedCount);
      setBulkExistingUsers(data.existingUsers || []);
      setBulkValidatedRows(validatedRows);

      setSuccessMessage(data.message || `Validated ${validatedRows.length} users.`);
      setToastType(failedCount > 0 ? 'warning' : 'success');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);

      if (failedCount > 0) {
        const firstError = data?.errors?.[0]?.error;
        setFormError(`Some rows failed (${failedCount}). ${firstError ? `First error: ${firstError}` : ''}`);
      }
    } catch {
      setFormError('Failed to import Excel file.');
    } finally {
      setIsBulkImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleBulkCommit = async () => {
    if (!bulkValidatedRows.length) {
      if (bulkExistingUsers.length > 0) {
        setFormError('All users in this file already exist in the database.');
      } else {
        setFormError('Please import a valid Excel file with zero errors before sending invites.');
      }
      return;
    }

    if (bulkValidationErrorCount > 0) {
      // Not blocking, just a sanity check if they really want to proceed
      if (!window.confirm(`There are ${bulkValidationErrorCount} row(s) with errors which will be skipped. Do you want to proceed inviting the other ${bulkValidatedRows.length} users?`)) {
        return;
      }
    }

    setIsBulkCommitting(true);
    setFormError('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/invite/bulk/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: bulkValidatedRows.map((row) => ({
            row: row.row,
            payload: row.payload
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error || data.message || 'Failed to send bulk invite emails.');
        return;
      }

      const invitedRows = Array.isArray(data.invited) ? data.invited : [];
      const importedUsers = invitedRows.map((item: BulkInvitedUser) => toUserRecordFromBulkInvite(item));

      setUsers((prev) => {
        const existingEmails = new Set(prev.map((u) => u.email.toLowerCase()));
        const next = importedUsers.filter((u) => !existingEmails.has(u.email.toLowerCase()));
        return [...next, ...prev];
      });

      setSuccessMessage(data.message || `Invited ${importedUsers.length} users.`);
      setToastType(Number(data?.summary?.emailFailedCount || 0) > 0 ? 'warning' : 'success');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      setBulkValidatedRows([]);
      setBulkValidationErrorCount(0);
      setBulkExistingUsers([]);
      setIsInviteFinished(true);
    } catch (err: any) {
      console.error('Bulk commit error:', err);
      setFormError(err.message || 'Failed to send bulk invite emails. Check the console for details.');
    } finally {
      setIsBulkCommitting(false);
    }
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
              className={cn(
                "fixed top-0 left-1/2 z-[100] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold",
                toastType === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-full"
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Header */}
          <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-900">User Management</h1>
              <p className="text-xs text-slate-500 font-bold hidden md:block">Manage system users, roles, and permissions.</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={disableAllUsersAction}
                  disabled={isActionSubmitting || users.every((u) => u.status === 'Inactive' || u.status === 'Deleted')}
                  className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-60"
                  title="Disable All Active Users"
                >
                  Disable All
                </button>
                <button
                  onClick={hardDeleteUsersAction}
                  disabled={isActionSubmitting || users.length === 0}
                  className="bg-slate-900 text-white p-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-black/20 disabled:opacity-60"
                  title="Permanent Database Cleanup (Hard Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </header>

          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm w-full transition-all outline-none"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto items-center flex-nowrap overflow-x-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <select 
                value={roleFilter}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setRoleFilter(newRole);
                  // Reset generation and class filters when not filtering by Students
                  if (newRole !== 'Students') {
                    setGenerationFilter('All Generations');
                    setClassFilter('All Classes');
                  }
                }}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>All Roles</option>
                <option>Students</option>
                <option>Teachers</option>
                <option>Admins</option>
              </select>
              <select 
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>All Genders</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              {roleFilter === 'Students' && (
                <>
                  <select 
                    value={generationFilter}
                    onChange={(e) => setGenerationFilter(e.target.value)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>All Generations</option>
                    <option>2026</option>
                    <option>2027</option>
                  </select>
                  <select 
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>All Classes</option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-hidden">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-4 md:px-6 py-4 w-[60%] sm:w-[35%] lg:w-[30%]">User</th>
                    <th className="px-4 md:px-6 py-4 hidden sm:table-cell sm:w-[15%]">Role</th>
                    <th className="px-6 py-4 hidden md:table-cell md:w-[25%] lg:w-[20%]">Class/Department</th>
                    <th className="px-6 py-4 hidden lg:table-cell lg:w-[15%]">Student ID</th>
                    <th className="px-6 py-4 hidden sm:table-cell sm:w-[15%] lg:w-[10%]">Status</th>
                    <th className="px-4 md:px-6 py-4 text-right w-[40%] sm:w-[20%] lg:w-[10%]">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.tbody
                    key={currentPage}
                    initial={{ opacity: 0, x: pageDirection >= 0 ? 10 : -10, scale: 0.995 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: pageDirection >= 0 ? -10 : 10, scale: 0.995 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="divide-y divide-slate-100"
                    style={{ willChange: 'transform, opacity' }}
                  >
                  {paginatedUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 6, scale: 0.998 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ scale: 0.992 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.018, 0.16), ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "transition-colors duration-300 group cursor-pointer relative",
                          user.status === 'Inactive' ? "grayscale opacity-60 bg-slate-50 hover:bg-slate-100" : "hover:bg-slate-50/50"
                        )}
                        onClick={() => handleViewUser(user)}
                        style={{ willChange: 'transform, opacity' }}
                      >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 hidden sm:block">
                              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={cn("size-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0", user.color)}>
                              {user.initials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-sm font-black text-slate-900 truncate" title={user.name}>
                              {user.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 truncate" title={user.email}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          user.role.includes('Admin') ? "bg-orange-50 text-orange-600" :
                          user.role === 'Teacher' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                        <div className="text-xs font-bold text-slate-600 truncate" title={user.group}>{user.group}</div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs font-bold text-slate-600">{user.studentId || '-'}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          user.status === 'Active'
                            ? "bg-emerald-50 text-emerald-600"
                            : user.status === 'Deleted'
                              ? "bg-rose-50 text-rose-600"
                            : user.status === 'Pending'
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-100 text-slate-400"
                        )}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleUserActive(user); }}
                            disabled={user.status === 'Deleted' || isActionSubmitting}
                            className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-40"
                            title={user.status === 'Active' ? 'Disable user' : 'Enable user'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const u = users.find(u => u.id === user.id);
                              if (u) setConfirmAction({ kind: 'hard-delete', user: u });
                            }}
                            disabled={isActionSubmitting}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                            title="Hard Delete (Permanent Removal)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {Array.from({ length: emptyRows }).map((_, index) => (
                    <tr key={`empty-row-${currentPage}-${index}`} aria-hidden="true" className="pointer-events-none">
                      <td colSpan={6} className="px-6 py-0">
                        <div className="h-[73px]" />
                      </td>
                    </tr>
                  ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * USERS_PER_PAGE + 1}
                -
                {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPageDirection(-1);
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setPageDirection(1);
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                  }}
                  disabled={currentPage === totalPages || filteredUsers.length === 0}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </main>

      {/* Confirm Action Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isActionSubmitting && setConfirmAction(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 14 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7"
            >
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {confirmAction.kind === 'delete'
                  ? 'Delete User?'
                : confirmAction.kind === 'hard-delete'
                  ? 'Permenent User Removal?'
                  : confirmAction.kind === 'delete-all'
                    ? 'Delete All Users?'
                  : confirmAction.kind === 'disable-all'
                    ? 'Disable All Users?'
                  : confirmAction.kind === 'hard-delete-all'
                    ? 'Permanent Data Cleanup?'
                  : confirmAction.shouldEnable
                    ? 'Enable User?'
                    : 'Disable User?'}
              </h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {confirmAction.kind === 'delete'
                  ? `Are you sure you want to delete "${confirmAction.user.name}"? This keeps the record for history, but disables login and marks the user as deleted.`
                : confirmAction.kind === 'hard-delete'
                  ? `EXTREME ACTION: Are you sure you want to PERMANENTLY DELETE "${confirmAction.user.name}"? This will remove the user and all their associated data from the database forever. This cannot be undone.`
                  : confirmAction.kind === 'delete-all'
                    ? 'Are you sure you want to delete all users? This keeps records for history, but disables login and marks every account as deleted.'
                  : confirmAction.kind === 'disable-all'
                    ? 'Are you sure you want to disable all users? This will prevent everyone except admins from logging into the platform.'
                  : confirmAction.kind === 'hard-delete-all'
                    ? 'EXTREME ACTION: Are you sure you want to PERMANENTLY DELETE all non-admin users from the database? This action cannot be undone.'
                  : confirmAction.shouldEnable
                    ? `Are you sure you want to enable "${confirmAction.user.name}"? The user will be able to log in again.`
                    : `Are you sure you want to disable "${confirmAction.user.name}"? The user will not be able to log in.`}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={isActionSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  disabled={isActionSubmitting}
                  className={cn(
                    "px-4 py-2 rounded-xl text-white text-xs font-black uppercase tracking-widest disabled:opacity-60",
                    confirmAction.kind === 'delete' || confirmAction.kind === 'delete-all' || confirmAction.kind === 'hard-delete-all' || confirmAction.kind === 'hard-delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : confirmAction.kind === 'disable-all'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {isActionSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative flex max-h-[92vh] w-full max-w-[72rem] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
            >
              <div className="flex-1 overflow-y-auto p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {isInviteFinished ? 'Invitation Sent' : 'Invite New User'}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {isInviteFinished ? 'The invitation process has completed successfully.' : 'Send an email invite with registration link.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!isInviteFinished && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleBulkImport}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isBulkImporting || isSubmitting || isBulkCommitting}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                          <Upload className="w-4 h-4" />
                          {isBulkImporting ? 'Importing...' : 'Import Excel'}
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkCommit}
                          disabled={isBulkImporting || isSubmitting || isBulkCommitting || !bulkValidatedRows.length}
                          className="px-3 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-60"
                        >
                          {isBulkCommitting ? 'Sending...' : 'Send Invite Email'}
                        </button>
                      </>
                    )}
                    <button 
                       onClick={() => {
                         setIsModalOpen(false);
                         setTimeout(() => {
                           setIsInviteFinished(false);
                           setBulkExistingUsers([]);
                           setBulkValidatedRows([]);
                           setBulkValidationErrorCount(0);
                         }, 300);
                       }}
                       className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                     >
                       <X className="w-6 h-6 text-slate-400" />
                     </button>
                  </div>
                </div>

                {isInviteFinished ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="size-24 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 shadow-inner relative">
                      <CheckCircle2 className="w-12 h-12" />
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-4 border-emerald-200"
                      />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Emails Sent Successfully!</h3>
                    <p className="text-slate-500 max-w-lg mx-auto mb-10 text-base font-medium leading-relaxed">
                      {successMessage || "The invitation emails have been sent to the users."}
                      <br />
                      <span className="text-sm opacity-70">Users can now secure their accounts by following the registration link in their inbox.</span>
                    </p>
                    <button 
                      onClick={() => {
                        setIsModalOpen(false);
                        setTimeout(() => {
                          setIsInviteFinished(false);
                          setBulkExistingUsers([]);
                          setBulkValidatedRows([]);
                        }, 300);
                      }}
                      className="px-12 py-4 bg-primary text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Return to User List
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-bold">
                      Excel template headers: First Name, Last Name, Email Address, Gender (Male/Female/Other), Role (Student/Teacher/Admin), Generation (e.g., 2026), Class (e.g., A), Student ID (Format: YYYY-XXX), Major.
                    </p>
                    
                    {bulkExistingUsers.length > 0 && (
                      <div className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                          <p className="uppercase tracking-widest text-[9px] opacity-70">Skipped (Users already exist):</p>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {bulkExistingUsers.map((u, i) => (
                            <span key={i} className="flex items-center gap-1.5 bg-white/50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                              <span className="text-amber-900">{u.name}</span>
                              <span className="text-amber-600/60 font-medium">{u.email}</span>
                            </span>
                          ))}
                        </div>
                        <p className="mt-2 text-[10px] text-amber-600/80 italic">These users were skipped automatically as they are already in the system.</p>
                      </div>
                    )}

                    {bulkValidatedRows.length > 0 && bulkValidationErrorCount === 0 && (
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p>Excel validation passed for {bulkValidatedRows.length} rows. Click <strong>Send Invite Email</strong> to process.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="e.g. Sokha"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mean"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="e.g. sokha.mean@pnc.edu"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-400 font-bold ml-1">Invite will be sent to this email.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
                        <select
                          value={newUser.gender}
                          onChange={(e) => setNewUser({ ...newUser, gender: e.target.value as Gender })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</label>
                        <select 
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          <option value="Student">Student</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      {newUser.role === 'Student' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Generation</label>
                          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-2 py-2">
                            <button
                              type="button"
                              onClick={() =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  generation: String(Math.max(2000, (Number(prev.generation) || 2026) - 1))
                                }))
                              }
                              className="size-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="text"
                              value={newUser.generation}
                              onChange={(e) => setNewUser({...newUser, generation: e.target.value })}
                              placeholder="e.g. 2028"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-black text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setNewUser((prev) => ({
                                  ...prev,
                                  generation: String(Math.min(2100, (Number(prev.generation) || 2026) + 1))
                                }))
                              }
                              className="size-9 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Details</label>
                          <input 
                            disabled
                            type="text" 
                            value={newUser.role === 'Teacher' ? 'Teaching Staff' : 'Administration'}
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-100 rounded-2xl text-sm text-slate-500 outline-none transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {newUser.role === 'Student' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 ml-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Major</label>
                            <button
                              type="button"
                              onClick={() => {
                                const nextMajor = customMajorDraft.trim().toUpperCase();
                                if (!nextMajor) return;
                                if (!majorOptions.includes(nextMajor)) {
                                  setMajorOptions((prev) => [...prev, nextMajor]);
                                }
                                setNewUser((prev) => ({ ...prev, major: nextMajor }));
                                setCustomMajorDraft('');
                              }}
                              className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-600"
                              title="Add new major"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <select
                            value={newUser.major}
                            onChange={(e) => {
                              const nextMajor = e.target.value.toUpperCase();
                              setNewUser({ ...newUser, major: nextMajor as StudentMajor });
                            }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          >
                            {majorOptions.map((major) => (
                              <option key={major} value={major}>{major}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={customMajorDraft}
                            onChange={(e) => setCustomMajorDraft(e.target.value)}
                            placeholder="Add new major manually"
                            className="w-full px-4 py-2.5 bg-white border border-emerald-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Class</label>
                          <select
                            value={newUser.className}
                            onChange={(e) => setNewUser({ ...newUser, className: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          >
                            <option value="">Select class</option>
                            {classOptions.map((classOption) => (
                              <option key={classOption} value={classOption}>{classOption}</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-400 font-bold ml-1">Classes available for selected generation</p>
                        </div>

                        <div className="space-y-2 md:col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student ID</label>
                          <input
                            type="text"
                            placeholder={`${newUser.generation}-001`}
                            value={newUser.studentId}
                            onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                          <p className="text-[10px] text-slate-400 font-bold ml-1">Format: YYYY-XXX (example: 2026-001)</p>
                        </div>
                      </div>
                    )}

                    {formError && (
                      <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                        {formError}
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all uppercase tracking-widest"
                      >
                        {isSubmitting ? 'Sending Invite...' : 'Send Invite Email'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && selectedProfileUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsProfileModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-black text-slate-900 px-2 tracking-tight">User Profile</h3>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

                <div className="p-8 overflow-y-auto">
                 <div className="flex items-start gap-6 mb-8">
                   {selectedProfileUser.profileImage ? (
                     <img src={selectedProfileUser.profileImage} alt={selectedProfileUser.name} className="size-24 rounded-2xl object-cover" />
                   ) : (
                     <div className={cn("size-24 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0", selectedProfileUser.color)}>
                       {selectedProfileUser.initials}
                     </div>
                   )}
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedProfileUser.name}</h2>
                     <p className="text-sm font-bold text-slate-500 mb-4">{selectedProfileUser.email}</p>
                     <div className="flex gap-2 flex-wrap">
                       <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest">{selectedProfileUser.role}</span>
                       <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest shrink-0">{selectedProfileUser.status}</span>
                       {selectedProfileUser.gender && (
                         <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-black uppercase tracking-widest shrink-0">{selectedProfileUser.gender}</span>
                       )}
                       {selectedProfileUser.role === 'Student' && (
                         <button
                           type="button"
                           onClick={() => setIsEvaluationListOpen((prev) => !prev)}
                           className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                         >
                           {isEvaluationListOpen ? 'Hide Evaluations' : 'Evaluation List'}
                         </button>
                       )}
                     </div>
                     {selectedProfileUser.role === 'Student' && isEvaluationListOpen && (
                       <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                         {profileEvaluations.length > 0 ? (
                           <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                             {profileEvaluations.map((evaluation) => {
                               const isActive = selectedEvaluationId === evaluation.id;
                               return (
                                 <button
                                   key={evaluation.id}
                                   type="button"
                                   onClick={() => setSelectedEvaluationId(evaluation.id)}
                                   className={cn(
                                     "w-full text-left px-4 py-3 rounded-xl border transition-all",
                                     isActive
                                       ? "border-primary bg-white shadow-sm"
                                       : "border-slate-200 bg-white hover:border-slate-300"
                                   )}
                                 >
                                   <div className="flex items-center justify-between gap-3">
                                     <div>
                                       <p className="text-sm font-black text-slate-900">
                                         {formatPeriodLabel(evaluation.period)} Evaluation
                                       </p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                         Finished: {formatEvalDate(evaluation.submitted_at || evaluation.created_at)}
                                       </p>
                                     </div>
                                     <div className="flex items-center gap-3">
                                       <span className="text-xs font-black text-primary">
                                         {Number(evaluation.average_score || 0).toFixed(1)}
                                       </span>
                                         <button
                                         type="button"
                                         onClick={(event) => {
                                           event.stopPropagation();
                                           openDeleteEvaluationConfirm(evaluation);
                                         }}
                                         disabled={deletingEvaluationId === evaluation.id}
                                         className={cn(
                                           "p-2 rounded-lg border transition-colors",
                                           deletingEvaluationId === evaluation.id
                                             ? "border-rose-200 bg-rose-50 text-rose-400"
                                             : "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                         )}
                                         title="Delete evaluation"
                                       >
                                         <Trash2 className="w-4 h-4" />
                                       </button>
                                     </div>
                                   </div>
                                 </button>
                               );
                             })}
                           </div>
                         ) : (
                           <p className="text-xs font-bold text-slate-400">No evaluations found for this student.</p>
                         )}
                       </div>
                     )}
                   </div>
                 </div>

                 {selectedProfileUser.role === 'Student' && (
                   <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-4">
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Edit Details</h4>
                         <div className="space-y-4">
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student ID</label>
                             <input type="text" value={editStudentId} onChange={e => setEditStudentId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all" />
                           </div>
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Class</label>
                             <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all" />
                           </div>
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Generation</label>
                             <input type="text" value={editGeneration} onChange={e => setEditGeneration(e.target.value)} placeholder="e.g., 2026" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all" />
                           </div>
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Gender</label>
                             <select value={editGender} onChange={e => setEditGender(e.target.value as Gender | '')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all">
                               <option value="">Select Gender</option>
                               <option value="male">Male</option>
                               <option value="female">Female</option>
                             </select>
                           </div>
                           <button onClick={handleUpdateStudentInfo} disabled={isProfileSaving} className="w-full py-3 mt-2 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60">
                             {isProfileSaving ? 'Saving...' : 'Save Changes'}
                           </button>
                         </div>
                      </div>

                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Performance Overview</h4>
                         {profileEvaluations.length > 0 ? (
                           <div className="bg-slate-50 rounded-3xl p-6 h-[320px] border border-slate-100 shadow-inner flex items-center justify-center relative overflow-hidden">
                              <RadarChart
                                 data={globalCriteria
                                   .filter(c => String(c.status).toLowerCase() === 'active')
                                   .map((criterion, idx) => {
                                     const activeEvaluation = profileEvaluations.find((item) => item.id === selectedEvaluationId) || profileEvaluations[0];
                                     const response = (activeEvaluation?.responses || []).find((r: any) =>
                                       String(r.criterion_id || r.criterion_key || '').trim() === String(criterion.id || '').trim() ||
                                       String(r.criterion_name || '').trim().toLowerCase() === String(criterion.name || '').trim().toLowerCase()
                                     );
                                     return {
                                       subject: String(criterion.name || `Criterion ${idx + 1}`),
                                       score: response ? Number(response.star_value || 0) : 0
                                     };
                                   })
                                 }
                                 dataKeys={[ { key: 'score', name: 'Performance', color: '#5d5fef', fill: '#5d5fef' } ]}
                                 maxValue={globalRatingScale}
                               />
                           </div>
                         ) : (
                           <div className="h-[320px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                             <div className="text-center w-full px-6">
                               <div className="size-16 rounded-full bg-slate-200/50 mx-auto mb-4 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                               </div>
                               <h3 className="font-black text-slate-800 text-lg mb-2">No Performance Data</h3>
                               <p className="text-sm text-slate-500 font-medium">This student hasn't received any evaluations yet.</p>
                             </div>
                           </div>
                         )}
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteEvaluation && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => !deletingEvaluationId && setConfirmDeleteEvaluation(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Confirm Delete</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">Delete this evaluation?</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                    {confirmDeleteEvaluation.title}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Finished: {confirmDeleteEvaluation.finishedAt}
                  </p>
                </div>
                <button
                  onClick={() => !deletingEvaluationId && setConfirmDeleteEvaluation(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
                This action cannot be undone.
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteEvaluation(null)}
                  disabled={Boolean(deletingEvaluationId)}
                  className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvaluation(confirmDeleteEvaluation.id)}
                  disabled={Boolean(deletingEvaluationId)}
                  className="w-full py-3 rounded-2xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-60"
                >
                  {deletingEvaluationId ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}


