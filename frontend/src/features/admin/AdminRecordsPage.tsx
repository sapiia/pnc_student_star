import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  UserPlus,
  Download,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Plus,
  Minus,
  CheckCircle2,
  Pencil,
  Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';
import AdminMobileNav from '../../components/common/AdminMobileNav';
import { cn } from '../../lib/utils';
import { DEFAULT_AVATAR } from '../../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api';

interface AdminRecord {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Deleted' | 'Pending';
  role: string;
  accessLevel: string;
  profileImage: string;
  joinDate: string;
  phone?: string;
  lastLogin?: string;
}

export default function AdminRecordsPage() {
  const navigate = useNavigate();
  const [authAdminId, setAuthAdminId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRecord | null>(null);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  
  // Confirmation action flow
  const [confirmAction, setConfirmAction] = useState<{
    kind: 'delete' | 'hard-delete' | 'toggle-active' | 'disable-all' | 'hard-delete-all';
    admin?: AdminRecord;
    shouldEnable?: boolean;
  } | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  
  // Edit admin modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<AdminRecord>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const adminList = data
            .filter((u: any) => u.role.toLowerCase() === 'admin')
            .map((u: any) => {
              return {
                id: u.id,
                name: (u.name || '').trim() || [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || 'Admin',
                email: u.email,
                status: Number(u.is_deleted) === 1 ? 'Deleted' : (Number(u.is_disable) === 1 ? 'Inactive' : 'Active'),
                role: u.admin_role || 'System Administrator',
                accessLevel: u.access_level || 'Full Access',
                profileImage: String(u.profile_image || '').trim() || DEFAULT_AVATAR,
                joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
                phone: u.phone || 'N/A',
                lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'
              };
            });
          setAdmins(adminList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      const parsed = raw ? JSON.parse(raw) : null;
      const userId = Number(parsed?.id);
      if (Number.isInteger(userId) && userId > 0) {
        setAuthAdminId(userId);
      }
    } catch {
      setAuthAdminId(null);
    }
  }, []);

  const isSelfAdmin = (adminId?: number) =>
    Number.isInteger(adminId) && adminId > 0 && authAdminId != null && adminId === authAdminId;

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsActionSubmitting(true);

    try {
      if (confirmAction.kind === 'toggle-active' && confirmAction.admin) {
        const { admin, shouldEnable } = confirmAction;
        if (isSelfAdmin(admin.id)) {
          alert('You cannot disable your own admin account.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        // Prevent disabling the last active admin
        if (!shouldEnable && admins.filter(a => a.status === 'Active').length <= 1) {
          alert('Cannot disable the last active admin.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/users/${admin.id}/active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: shouldEnable })
        });
        if (response.ok) {
          setAdmins((prev) => prev.map((a) => a.id === admin.id ? { ...a, status: shouldEnable ? 'Active' : 'Inactive' } : a));
          setSuccessMessage(shouldEnable ? `Enabled ${admin.name}` : `Disabled ${admin.name}`);
          setToastType('success');
        } else {
          alert('Failed to update status.');
        }
      } else if (confirmAction.kind === 'hard-delete' && confirmAction.admin) {
        const { admin } = confirmAction;
        if (isSelfAdmin(admin.id)) {
          alert('You cannot delete your own admin account.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        // Prevent deleting the last admin
        if (admins.length <= 1) {
          alert('Cannot delete the only admin account.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/users/${admin.id}/hard`, { method: 'DELETE' });
        if (response.ok) {
          setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
          if (selectedAdmin?.id === admin.id) setSelectedAdmin(null);
          setSuccessMessage(`Permanently deleted ${admin.name}`);
          setToastType('warning');
        } else {
          alert('Failed to permanently delete admin.');
        }
      } else if (confirmAction.kind === 'delete' && confirmAction.admin) {
        const { admin } = confirmAction;
        if (isSelfAdmin(admin.id)) {
          alert('You cannot delete your own admin account.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        if (admins.length <= 1) {
          alert('Cannot delete the only admin account.');
          setIsActionSubmitting(false);
          setConfirmAction(null);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/users/${admin.id}`, { method: 'DELETE' });
        if (response.ok) {
          setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
          if (selectedAdmin?.id === admin.id) setSelectedAdmin(null);
          setSuccessMessage(`Deleted ${admin.name}`);
          setToastType('warning');
        } else {
          alert('Failed to delete admin.');
        }
      } else if (confirmAction.kind === 'disable-all') {
        // Prevent disabling all admins
        alert('Cannot disable all admin accounts.');
        setIsActionSubmitting(false);
        setConfirmAction(null);
        return;
      } else if (confirmAction.kind === 'hard-delete-all') {
        // Prevent bulk deleting all admins
        alert('Cannot bulk delete admin accounts.');
        setIsActionSubmitting(false);
        setConfirmAction(null);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      alert('Communication error.');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleEditAdmin = (admin: AdminRecord) => {
    setEditFormData({ ...admin });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAdmin) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormData.name,
          email: editFormData.email,
          admin_role: editFormData.role,
          access_level: editFormData.accessLevel,
          phone: editFormData.phone
        })
      });

      if (response.ok) {
        setAdmins((prev) => prev.map((a) => 
          a.id === selectedAdmin.id ? { ...a, ...editFormData } as AdminRecord : a
        ));
        setSelectedAdmin((prev) => prev ? { ...prev, ...editFormData } as AdminRecord : null);
        setSuccessMessage(`Updated ${editFormData.name}`);
        setToastType('success');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        setIsEditModalOpen(false);
      } else {
        alert('Failed to update admin.');
      }
    } catch (err) {
      console.error(err);
      alert('Communication error.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden relative">
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
        
        {/* Header */}
        <header className="h-auto min-h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 md:px-8 py-3 md:py-0 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-slate-900">Admin Records</h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Administrator Management</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-primary transition-colors">
              <Download className="w-5 h-5" />
            </button>

            <button 
              onClick={() => navigate('/admin/users', { state: { openInvite: true, prefillRole: 'admin' } })}
              className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Admin
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6 flex flex-col h-full">
              {/* Search & Filter */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search administrators..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Info Banner */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Admin Account Protection</p>
                    <p className="text-xs text-amber-700 mt-1">
                      For security reasons, you cannot disable or delete the last active admin account. 
                      Bulk actions are disabled for administrator accounts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Administrator</th>
                        <th className="px-6 py-4 hidden md:table-cell">Role</th>
                        <th className="px-6 py-4 hidden md:table-cell">Access Level</th>
                        <th className="px-6 py-4 hidden sm:table-cell text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdmins.map((admin) => (
                        <tr 
                          key={admin.id} 
                          onClick={() => setSelectedAdmin(admin)}
                          className={cn(
                            "hover:bg-slate-50 transition-colors group cursor-pointer",
                            selectedAdmin?.id === admin.id ? "bg-primary/5" : ""
                          )}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-sm">
                                <img src={admin.profileImage} alt={admin.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{admin.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{admin.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-xs font-bold text-slate-600">{admin.role}</span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-xs font-bold text-slate-600">{admin.accessLevel}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              admin.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                            )}>
                              {admin.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedAdmin(admin); }}
                                className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEditAdmin(admin); }}
                                className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                                title="Edit Admin"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (isSelfAdmin(admin.id)) {
                                    alert('You cannot disable your own admin account.');
                                    return;
                                  }
                                  // Prevent disabling the last active admin
                                  if (admin.status === 'Active' && admins.filter(a => a.status === 'Active').length <= 1) {
                                    alert('Cannot disable the last active admin.');
                                    return;
                                  }
                                  setConfirmAction({ kind: 'toggle-active', admin, shouldEnable: admin.status !== 'Active' }); 
                                }}
                                className={cn(
                                  "p-2 transition-colors rounded-lg",
                                  admin.status === 'Active' ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50",
                                  isSelfAdmin(admin.id) && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={isSelfAdmin(admin.id)}
                                title={admin.status === 'Active' ? 'Disable Admin' : 'Enable Admin'}
                              >
                                {admin.status === 'Active' ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (isSelfAdmin(admin.id)) {
                                    alert('You cannot delete your own admin account.');
                                    return;
                                  }
                                  // Prevent deleting the last admin
                                  if (admins.length <= 1) {
                                    alert('Cannot delete the only admin account.');
                                    return;
                                  }
                                  setConfirmAction({ kind: 'hard-delete', admin }); 
                                }}
                                className={cn("p-2 text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-50 rounded-lg", isSelfAdmin(admin.id) && "opacity-50 cursor-not-allowed")}
                                disabled={isSelfAdmin(admin.id)}
                                title={isSelfAdmin(admin.id) ? 'You cannot delete your own account' : 'Delete Admin'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filteredAdmins.length} administrators
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedAdmin && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="w-full md:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 relative z-20 fixed md:static inset-0 md:inset-auto"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Admin Details</h3>
                  <button 
                    onClick={() => setSelectedAdmin(null)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Profile Header */}
                  <div className="text-center">
                    <div className="size-24 rounded-3xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 mx-auto mb-4 shadow-md">
                      <img src={selectedAdmin.profileImage} alt={selectedAdmin.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">{selectedAdmin.name}</h4>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1 leading-none">{selectedAdmin.role}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedAdmin.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Access Level</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedAdmin.accessLevel}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Join Date</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedAdmin.joinDate}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 text-slate-400 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedAdmin.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => handleEditAdmin(selectedAdmin)}
                      className="flex-1 py-4 bg-primary/10 text-primary font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Admin
                    </button>
                    <button 
                      onClick={() => {
                        if (isSelfAdmin(selectedAdmin.id)) {
                          alert('You cannot delete your own admin account.');
                          return;
                        }
                        // Prevent deleting the last admin
                        if (admins.length <= 1) {
                          alert('Cannot delete the only admin account.');
                          return;
                        }
                        setConfirmAction({ kind: 'hard-delete', admin: selectedAdmin });
                      }}
                      disabled={isSelfAdmin(selectedAdmin.id)}
                      className={cn(
                        "flex-1 py-4 bg-rose-50 text-rose-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm",
                        isSelfAdmin(selectedAdmin.id) && "opacity-50 cursor-not-allowed hover:bg-rose-50"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Modal */}
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
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
              >
                <div className={cn(
                  "size-16 rounded-2xl flex items-center justify-center mb-6",
                  confirmAction.kind.includes('delete') ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
                )}>
                   {confirmAction.kind.includes('delete') ? <Trash2 className="w-8 h-8" /> : (confirmAction.shouldEnable ? <Plus className="w-8 h-8" /> : <Minus className="w-8 h-8" />)}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {confirmAction.kind === 'delete' ? 'Delete Admin?'
                    : confirmAction.kind === 'hard-delete' ? 'Permanent Removal?'
                    : confirmAction.shouldEnable ? 'Enable Admin?' : 'Disable Admin?'}
                </h3>
                
                <p className="mt-3 text-sm text-slate-600 font-bold leading-relaxed">
                  {confirmAction.kind === 'delete' ? `Delete "${confirmAction.admin?.name}"? Record will be archived.`
                    : confirmAction.kind === 'hard-delete' ? `EXTREME ACTION: Permanently remove "${confirmAction.admin?.name}"? This cannot be undone.`
                    : confirmAction.shouldEnable ? `Enable "${confirmAction.admin?.name}"? They will regain access.`
                    : `Disable "${confirmAction.admin?.name}"? They will lose access to the platform.`}
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={isActionSubmitting}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeConfirmedAction}
                    disabled={isActionSubmitting}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-60",
                      confirmAction.kind.includes('delete') ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    )}
                  >
                    {isActionSubmitting ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Admin Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isUpdating && setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
              >
                <div className="size-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                  <Crown className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Edit Administrator
                </h3>
                
                <p className="mt-3 text-sm text-slate-600 font-bold leading-relaxed">
                  Update administrator information and access level.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Admin Role
                    </label>
                    <input
                      type="text"
                      value={editFormData.role || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Access Level
                    </label>
                    <select
                      value={editFormData.accessLevel || 'Full Access'}
                      onChange={(e) => setEditFormData({ ...editFormData, accessLevel: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl text-sm transition-all outline-none shadow-sm"
                      disabled={isUpdating}
                    >
                      <option value="Full Access">Full Access</option>
                      <option value="Read Only">Read Only</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isUpdating || !editFormData.name || !editFormData.email}
                    className="flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 disabled:opacity-60"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
