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
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminSidebar from '../components/AdminSidebar';
import { cn } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';

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

type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  profile_image?: string | null;
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'profile'>('system');
  const [criteriaList, setCriteriaList] = useState(INITIAL_CRITERIA);
  const [ratingScale, setRatingScale] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCrit, setNewCrit] = useState({ name: '', icon: 'â¨', description: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    roleLabel: 'System Administrator',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: 'https://picsum.photos/seed/admin/200/200'
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

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
    const loadProfile = async () => {
      if (!authUser?.id) return;
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
          || 'https://picsum.photos/seed/admin/200/200';
        setProfileForm((prev) => ({
          ...prev,
          fullName: String(data.name || authUser.name || ''),
          email: String(data.email || authUser.email || ''),
          roleLabel: toRoleLabel(String(data.role || authUser.role || 'admin')),
          department: String(data.department || ''),
          photoUrl: savedPhoto
        }));
      } catch (error) {
        const fallbackPhoto = String(authUser.profile_image || '').trim()
          || localStorage.getItem(`profile_photo_${authUser.id}`)
          || 'https://picsum.photos/seed/admin/200/200';
        setProfileForm((prev) => ({
          ...prev,
          fullName: authUser.name || '',
          email: authUser.email || '',
          roleLabel: toRoleLabel(authUser.role || 'admin'),
          photoUrl: fallbackPhoto
        }));
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load profile.');
      }
    };

    loadProfile();
  }, [authUser]);

  const handleSave = async () => {
    setErrorMessage('');

    if (activeTab === 'system') {
      setSuccessMessage('Settings saved successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    if (!authUser?.id) {
      setErrorMessage('You must login first to edit profile.');
      return;
    }

    const fullName = profileForm.fullName.trim();
    const email = profileForm.email.trim().toLowerCase();
    const department = profileForm.department.trim();
    const shouldChangePassword = Boolean(
      profileForm.currentPassword.trim() ||
      profileForm.newPassword.trim() ||
      profileForm.confirmPassword.trim()
    );

    if (!fullName) {
      setErrorMessage('Full name is required.');
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
        fullName: updatedUser.name || '',
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

  const handleAddCriterion = () => {
    if (!newCrit.name) return;
    const id = `CRIT-00${criteriaList.length + 1}`;
    setCriteriaList([...criteriaList, { ...newCrit, id, status: 'Active' }]);
    setNewCrit({ name: '', icon: 'â¨', description: '' });
    setShowAddModal(false);
  };

  const handleDeleteCriterion = (id: string) => {
    if (confirm('Are you sure you want to remove this evaluation criterion?')) {
      setCriteriaList(criteriaList.filter(c => c.id !== id));
    }
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
        window.dispatchEvent(new Event('profile-photo-updated'));
        window.dispatchEvent(new Event('profile-updated'));
        setSuccessMessage('Profile photo updated.');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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

        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-900">Settings</h1>
            <div className="h-4 w-px bg-slate-200" />
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
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === 'system' ? (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900">Evaluation Criteria Management</h2>
                <p className="text-slate-500 font-bold">Manage the core evaluation pillars and descriptive student guidance tips.</p>
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
                    onClick={() => setShowAddModal(true)}
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
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence initial={false}>
                        {criteriaList.map((item) => (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                                {item.icon}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-black text-slate-900">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {item.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-md">
                              <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-1 group-hover:line-clamp-none transition-all">
                                {item.description}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCriterion(item.id)}
                                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
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
                          <span className="text-xs font-black text-primary">90 days</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mb-4">Defines the frequency of mandatory student performance reviews.</p>
                        <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
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
                      <img src={profileForm.photoUrl || 'https://picsum.photos/seed/admin/200/200'} alt={profileForm.fullName || 'Admin'} />
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
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
                    <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                    <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
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
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Add New Criterion</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Criterion Name</label>
                      <input 
                        type="text" 
                        value={newCrit.name}
                        onChange={(e) => setNewCrit({ ...newCrit, name: e.target.value })}
                        placeholder="e.g., Communication Skills"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Icon (Emoji)</label>
                      <input 
                        type="text" 
                        value={newCrit.icon}
                        onChange={(e) => setNewCrit({ ...newCrit, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                      <textarea 
                        value={newCrit.description}
                        onChange={(e) => setNewCrit({ ...newCrit, description: e.target.value })}
                        placeholder="Describe what students should reflect on..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 flex gap-3">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCriterion}
                    className="flex-1 py-3 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Add Criterion
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


