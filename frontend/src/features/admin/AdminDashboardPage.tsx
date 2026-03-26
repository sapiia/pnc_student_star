import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminDashboardHeader from '../../components/admin/dashboard/AdminDashboardHeader';
import AdminDashboardOverview from '../../components/admin/dashboard/AdminDashboardOverview';
import DashboardSidebar from '../../components/admin/dashboard/DashboardSidebar';
import EditPendingUserModal from '../../components/admin/dashboard/EditPendingUserModal';
import PendingUsersCard from '../../components/admin/dashboard/PendingUsersCard';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import { API_BASE_URL } from '../../lib/api';

import type {
  DashboardSortBy,
  DashboardSortOrder,
  EditUserFormState,
} from '../../components/admin/dashboard/adminDashboard.types';
import {
  buildEditUserState,
  buildStudentClassLabel,
  EMPTY_EDIT_USER_FORM,
} from '../../components/admin/dashboard/adminDashboard.utils';
import { useAdminDashboardData } from '../../components/admin/dashboard/useAdminDashboardData';

const PENDING_PAGE_SIZE = 5;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [pendingPage, setPendingPage] = useState(1);
  const [sortBy, setSortBy] = useState('generation' as DashboardSortBy);
  const [sortOrder, setSortOrder] = useState('desc' as DashboardSortOrder);
  const [generationActionLoading, setGenerationActionLoading] = useState({} as Record<string, boolean>);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null as number | null);
  const [editError, setEditError] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editUser, setEditUser] = useState(EMPTY_EDIT_USER_FORM as EditUserFormState);
  const { dashboardData, refreshDashboard } = useAdminDashboardData(sortBy, sortOrder);

  const studentStats = dashboardData?.studentStats ?? null;
  const teacherCount = dashboardData?.teacherCount ?? 0;
  const adminCount = dashboardData?.adminCount ?? 0;
  const pendingUsers = dashboardData?.pendingUsers ?? [];

  const pendingTotalPages = Math.max(1, Math.ceil(pendingUsers.length / PENDING_PAGE_SIZE));
  const paginatedPendingUsers = pendingUsers.slice(
    (pendingPage - 1) * PENDING_PAGE_SIZE,
    pendingPage * PENDING_PAGE_SIZE,
  );

  useEffect(() => {
    setPendingPage(1);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (pendingPage > pendingTotalPages) {
      setPendingPage(pendingTotalPages);
    }
  }, [pendingPage, pendingTotalPages]);

  const closeEditModal = () => {
    if (isEditSubmitting) return;
    setIsEditModalOpen(false);
    setEditUserId(null);
    setEditError('');
    setEditUser(EMPTY_EDIT_USER_FORM);
  };

  const handleEditUserChange = <Field extends keyof EditUserFormState>(
    field: Field,
    value: EditUserFormState[Field],
  ) => {
    setEditUser((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleToggleGeneration = async (generation: string, activeCount: number) => {
    try {
      setGenerationActionLoading((previous) => ({ ...previous, [generation]: true }));
      const shouldEnable = activeCount === 0;

      const response = await fetch(`${API_BASE_URL}/users/generation/${generation}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: shouldEnable }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to update generation status.');
        return;
      }

      await refreshDashboard();
    } catch (error) {
      console.error(error);
      alert('Failed to update generation status.');
    } finally {
      setGenerationActionLoading((previous) => ({ ...previous, [generation]: false }));
    }
  };

  const openEditPendingUser = async (userId: number) => {
    setEditError('');
    setEditUserId(userId);
    setIsEditModalOpen(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load user details.');
      }

      const user = await response.json();
      setEditUser(buildEditUserState(user));
    } catch (error: any) {
      setEditError(error?.message || 'Failed to load user details.');
    }
  };

  const handleSaveEditUser = async (event: any) => {
    event.preventDefault();
    if (!editUserId || isEditSubmitting) return;

    setEditError('');

    const trimmedEmail = editUser.email.trim().toLowerCase();
    const trimmedFirstName = editUser.firstName.trim();
    const trimmedLastName = editUser.lastName.trim();
    const trimmedGeneration = editUser.generation.trim();
    const trimmedMajor = editUser.major.trim().toUpperCase();
    const trimmedClass = editUser.className.trim().toUpperCase();
    const trimmedStudentId = editUser.studentId.trim();
    const roleValue = editUser.role.toLowerCase();

    if (!trimmedEmail) {
      setEditError('Email is required.');
      return;
    }

    if (!trimmedFirstName) {
      setEditError('First name is required.');
      return;
    }

    if (roleValue === 'student') {
      const studentIdPattern = /^\d{4}-\d{3}$/;

      if (!trimmedGeneration || !/^\d{4}$/.test(trimmedGeneration)) {
        setEditError('Generation must be a 4-digit year.');
        return;
      }

      if (!trimmedMajor) {
        setEditError('Major is required for student.');
        return;
      }

      if (trimmedStudentId && !studentIdPattern.test(trimmedStudentId)) {
        setEditError('Student ID must match format YYYY-XXX (example: 2028-001).');
        return;
      }

      if (trimmedStudentId && !trimmedStudentId.startsWith(`${trimmedGeneration}-`)) {
        setEditError('Student ID year must match selected generation.');
        return;
      }
    }

    const resolvedName = `${trimmedFirstName} ${trimmedLastName}`.trim();
    const classLabel = roleValue === 'student'
      ? buildStudentClassLabel(trimmedGeneration, trimmedMajor, trimmedClass)
      : trimmedClass || null;

    try {
      setIsEditSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resolvedName,
          email: trimmedEmail,
          gender: editUser.gender,
          role: roleValue,
          class_name: classLabel,
          student_id: roleValue === 'student' ? trimmedStudentId : null,
          generation: roleValue === 'student' ? trimmedGeneration : null,
          major: roleValue === 'student' ? trimmedMajor : null,
          className: trimmedClass,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user.');
      }

      await refreshDashboard();
      setIsEditModalOpen(false);
      setEditUserId(null);
      setEditError('');
      setEditUser(EMPTY_EDIT_USER_FORM);
    } catch (error: any) {
      setEditError(error?.message || 'Failed to update user.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminMobileNav />
        <AdminDashboardHeader />

        <div className="mx-auto max-w-7xl space-y-6 p-4 pb-24 md:p-6 md:pb-8 lg:space-y-8 lg:p-8">
          <AdminDashboardOverview
            studentStats={studentStats}
            teacherCount={teacherCount}
            adminCount={adminCount}
            generationActionLoading={generationActionLoading}
            onOpenUsers={() => navigate('/admin/users')}
            onOpenTeachers={() => navigate('/admin/teachers')}
            onOpenClass={(generation, className) =>
              navigate(`/admin/students/${generation}/${encodeURIComponent(className)}`)
            }
            onToggleGeneration={handleToggleGeneration}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <PendingUsersCard
              users={paginatedPendingUsers}
              totalUsers={pendingUsers.length}
              currentPage={pendingPage}
              totalPages={pendingTotalPages}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
              onAddUser={() => navigate('/admin/users', { state: { openInvite: true } })}
              onEditUser={openEditPendingUser}
              onPreviousPage={() => setPendingPage((previous) => Math.max(1, previous - 1))}
              onNextPage={() => setPendingPage((previous) => Math.min(pendingTotalPages, previous + 1))}
            />

            <DashboardSidebar
              studentStats={studentStats}
              generationActionLoading={generationActionLoading}
              onToggleGeneration={handleToggleGeneration}
            />
          </div>
        </div>
      </main>

      <EditPendingUserModal
        isOpen={isEditModalOpen}
        user={editUser}
        error={editError}
        isSubmitting={isEditSubmitting}
        onClose={closeEditModal}
        onSubmit={handleSaveEditUser}
        onFieldChange={handleEditUserChange}
      />
    </div>
  );
}
