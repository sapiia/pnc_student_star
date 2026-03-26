import { useNavigate } from 'react-router-dom';

import AdminRecordConfirmModal from '../../components/admin/records/AdminRecordConfirmModal';
import AdminRecordDetailsPanel from '../../components/admin/records/AdminRecordDetailsPanel';
import AdminRecordEditModal from '../../components/admin/records/AdminRecordEditModal';
import AdminRecordsHeader from '../../components/admin/records/AdminRecordsHeader';
import AdminRecordsTable from '../../components/admin/records/AdminRecordsTable';
import AdminRecordsToast from '../../components/admin/records/AdminRecordsToast';
import AdminRecordsToolbar from '../../components/admin/records/AdminRecordsToolbar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';

import { useAdminRecordsPage } from '../../components/admin/records/useAdminRecordsPage';

export default function AdminRecordsPage() {
  const navigate = useNavigate();
  const {
    closeConfirmAction,
    closeEditModal,
    confirmAction,
    editFormData,
    editTarget,
    executeConfirmedAction,
    filteredAdmins,
    isActionSubmitting,
    isLoading,
    isSelfAdmin,
    isUpdating,
    openEditModal,
    requestDeleteAdmin,
    requestToggleAdminStatus,
    saveEdit,
    searchQuery,
    selectedAdmin,
    setSearchQuery,
    setSelectedAdmin,
    toast,
    updateEditFormField,
  } = useAdminRecordsPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <AdminMobileNav />
        <AdminRecordsToast toast={toast} />
        <AdminRecordsHeader
          onBack={() => navigate('/admin/dashboard')}
          onAddAdmin={() =>
            navigate('/admin/users', {
              state: { openInvite: true, prefillRole: 'admin' },
            })
          }
        />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-8">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col space-y-6">
              <AdminRecordsToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <AdminRecordsTable
                admins={filteredAdmins}
                isLoading={isLoading}
                selectedAdminId={selectedAdmin?.id ?? null}
                onDeleteAdmin={requestDeleteAdmin}
                onEditAdmin={openEditModal}
                onSelectAdmin={setSelectedAdmin}
                onToggleAdminStatus={requestToggleAdminStatus}
                isSelfAdmin={isSelfAdmin}
              />
            </div>
          </div>

          <AdminRecordDetailsPanel
            admin={selectedAdmin}
            onClose={() => setSelectedAdmin(null)}
            onDelete={requestDeleteAdmin}
            onEdit={openEditModal}
            isSelfAdmin={isSelfAdmin}
          />
        </div>

        <AdminRecordConfirmModal
          action={confirmAction}
          isSubmitting={isActionSubmitting}
          onCancel={closeConfirmAction}
          onConfirm={executeConfirmedAction}
        />

        <AdminRecordEditModal
          admin={editTarget}
          formData={editFormData}
          isUpdating={isUpdating}
          onClose={closeEditModal}
          onFieldChange={updateEditFormField}
          onSave={saveEdit}
        />
      </main>
    </div>
  );
}
