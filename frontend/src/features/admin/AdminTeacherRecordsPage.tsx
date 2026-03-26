import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  UserPlus,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import { cn } from '../../lib/utils';
import AdminTeacherRecordsTable from '../../components/admin/teacher/AdminTeacherRecordsTable';
import AdminTeacherDetailPanel from '../../components/admin/teacher/AdminTeacherDetailPanel';
import AdminTeacherConfirmModal from '../../components/admin/teacher/AdminTeacherConfirmModal';
import AdminTeacherEditModal from '../../components/admin/teacher/AdminTeacherEditModal';
import { useAdminTeacherRecordsPage } from '../../components/admin/teacher/useAdminTeacherRecordsPage';
import type { TeacherRecord, TeacherConfirmAction, TeacherEditFormData, TeacherToast } from '../../components/admin/teacher/adminTeacherRecords.types';
import { API_BASE_URL } from '../../lib/api';

export default function AdminTeacherRecordsPage() {
  const navigate = useNavigate();
  const {
    filteredTeachers,
    searchQuery, 
    setSearchQuery,
    selectedGender, 
    setSelectedGender,
    selectedTeacher,
    isLoading,
    confirmAction,
    editTeacher,
    editFormData,
    isActionSubmitting,
    isUpdating,
    toast,
    closeConfirm,
    closeEditModal,
    executeConfirmedAction,
    openEditModal,
    requestToggleStatus: onToggleStatus,
    requestHardDelete: onHardDelete,
    requestDisableAll,
    requestHardDeleteAll,
    saveEdit,
    setSelected,
    updateEditField,
  } = useAdminTeacherRecordsPage();

  const requestDelete = (teacher: TeacherRecord) => {
    // Note: 'delete' action not in hook, map to hard-delete or adjust API
    onHardDelete(teacher);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <AdminMobileNav />

        {/* Success Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={cn(
                "fixed top-0 left-1/2 z-[100] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold",
                toast.type === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-slate-900">Teacher Records</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Teaching Staff Management</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors" aria-label="Download report" title="Download">
              <Download className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={requestDisableAll}
                disabled={isActionSubmitting}
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-60"
                title="Disable All Teachers"
              >
                Disable All
              </button>
              <button
                onClick={requestHardDeleteAll}
                disabled={isActionSubmitting}
                className="bg-slate-900 text-white p-2 rounded-xl hover:bg-black transition-all shadow-lg shadow-black/20 disabled:opacity-60"
                title="Delete All Teachers"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => navigate('/admin/users', { state: { openInvite: true, prefillRole: 'teacher' } })}
              className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              title="Add new teacher"
            >
              <UserPlus className="w-4 h-4" />
              Add Teacher
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6 flex flex-col h-full">
              {/* Search & Filter */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search teachers by name, email or department" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Filter by gender"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all" aria-label="More filters" title="More filters">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              <AdminTeacherRecordsTable
                teachers={filteredTeachers}
                selectedTeacherId={selectedTeacher?.id || null}
                isLoading={isLoading}
                onSelectTeacher={setSelected}
                onEdit={openEditModal}
                onToggleStatus={onToggleStatus}
                onHardDelete={onHardDelete}
              />
            </div>
          </div>

          <AdminTeacherDetailPanel
            teacher={selectedTeacher}
            onClose={() => setSelected(null)}
            onEdit={openEditModal}
            onHardDelete={onHardDelete}
          />
        </div>

        <AdminTeacherConfirmModal
          action={confirmAction}
          isSubmitting={isActionSubmitting}
          onConfirm={executeConfirmedAction}
          onCancel={closeConfirm}
        />

        <AdminTeacherEditModal
          teacher={editTeacher}
          formData={editFormData}
          isUpdating={isUpdating}
          onClose={closeEditModal}
          onFieldChange={updateEditField}
          onSave={saveEdit}
        />
      </main>
    </div>
  );
}

