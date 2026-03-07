import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  BellRing, 
  ChevronRight
} from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  profile_image?: string | null;
};

type ProfilePayload = {
  id: number;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  profile_image?: string | null;
  department?: string | null;
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export default function TeacherProfilePage() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: 'https://picsum.photos/seed/student/200/200'
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setErrorMessage('');
    if (!authUser?.id) return setErrorMessage('You must login first to edit profile.');

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profileForm.email.trim().toLowerCase();
    const department = profileForm.department.trim();
    const wantsPasswordChange = Boolean(profileForm.currentPassword || profileForm.newPassword || profileForm.confirmPassword);

    if (!firstName) return setErrorMessage('First name is required.');
    if (!email) return setErrorMessage('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErrorMessage('Invalid email format.');

    if (wantsPasswordChange) {
      if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
        return setErrorMessage('Please fill current, new, and confirm password fields.');
      }
      if (profileForm.newPassword.length < 6) return setErrorMessage('New password must be at least 6 characters.');
      if (profileForm.newPassword !== profileForm.confirmPassword) return setErrorMessage('New password and confirm password do not match.');
    }

    setIsSaving(true);
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, first_name: firstName, last_name: lastName, email, department })
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profileData.error || 'Failed to update profile.');

      if (wantsPasswordChange) {
        const passResponse = await fetch(`${API_BASE_URL}/users/${authUser.id}/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: profileForm.currentPassword,
            new_password: profileForm.newPassword
          })
        });
        const passData = await passResponse.json();
        if (!passResponse.ok) throw new Error(passData.error || 'Failed to change password.');
      }

      const updatedAuth: AuthUser = {
        id: authUser.id,
        name: profileData?.user?.name || fullName,
        email: profileData?.user?.email || email,
        role: authUser.role,
        profile_image: profileData?.user?.profile_image || authUser.profile_image || profileForm.photoUrl || null
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedAuth));
      setAuthUser(updatedAuth);
      window.dispatchEvent(new Event('profile-updated'));

      setProfileForm((prev) => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        fullName: String(updatedAuth.name || ''),
        email: String(updatedAuth.email || ''),
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccessMessage(wantsPasswordChange ? 'Profile and password updated successfully!' : 'Profile updated successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const userId = Number(parsed?.id);
      if (!Number.isInteger(userId) || userId <= 0) return;
      const user: AuthUser = {
        id: userId,
        name: parsed?.name,
        email: parsed?.email,
        role: parsed?.role,
        profile_image: parsed?.profile_image || null
      };
      setAuthUser(user);

      const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
      if (user.profile_image) {
        setProfileForm((prev) => ({ ...prev, photoUrl: String(user.profile_image) }));
      } else if (savedPhoto) {
        setProfileForm((prev) => ({ ...prev, photoUrl: savedPhoto }));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.id) return;
      setErrorMessage('');
      try {
        const response = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile`);
        let data: ProfilePayload = { id: authUser.id };
        try {
          data = await response.json();
        } catch {
          data = { id: authUser.id };
        }
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load profile.');
        }
        const fallbackName = String(data.name || authUser.name || '').trim();
        const fallbackParts = fallbackName.split(/\s+/).filter(Boolean);
        const derivedFirst = fallbackParts[0] || '';
        const derivedLast = fallbackParts.slice(1).join(' ');
        const firstName = String(data.first_name || '').trim() || derivedFirst;
        const lastName = String(data.last_name || '').trim() || derivedLast;
        setProfileForm((prev) => ({
          ...prev,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim() || fallbackName,
          email: String(data.email || authUser.email || '').trim(),
          photoUrl: String(data.profile_image || authUser.profile_image || prev.photoUrl || '').trim() || prev.photoUrl,
          department: String(data.department || '').trim()
        }));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load profile.');
      }
    };
    loadProfile();
  }, [authUser]);

  const handlePhotoPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.');
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile-image`, {
        method: 'PATCH',
        body: formData
      });

      let data: any = {};
      const rawText = await response.text();
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || 'Server returned an invalid response.' };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile image.');
      }

      const updatedPhoto = String(data?.user?.profile_image || '').trim();
      if (!updatedPhoto) {
        throw new Error('Profile image was not returned by server.');
      }

      const updatedAuth: AuthUser = {
        ...authUser,
        name: data?.user?.name || authUser.name,
        email: data?.user?.email || authUser.email,
        profile_image: updatedPhoto
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedAuth));
      localStorage.setItem(`profile_photo_${authUser.id}`, updatedPhoto);
      setAuthUser(updatedAuth);
      setProfileForm((prev) => ({ ...prev, photoUrl: updatedPhoto }));
      window.dispatchEvent(new Event('profile-photo-updated'));
      window.dispatchEvent(new Event('profile-updated'));
      setSuccessMessage('Profile photo updated.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile image.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
            >
              <BellRing className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <button onClick={() => navigate('/teacher/dashboard')} className="hover:text-primary">Dashboard</button>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-slate-900">Settings</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
              <p className="text-slate-500 mt-2">Update your profile, security credentials, and stay notified.</p>
            </header>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Personal Information */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Personal Information</h2>
                <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/10">
                  Active Teacher
                </span>
              </div>
                <div className="p-8 flex flex-col md:flex-row gap-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                      <img src={profileForm.photoUrl} alt={profileForm.fullName || 'Teacher'} />
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                      />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Account Security */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Account Security</h2>
                <p className="text-xs text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                    <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                    <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                    <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
                </div>
              </div>
            </motion.section>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                onClick={() => {
                  setProfileForm((prev) => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                  setErrorMessage('');
                }}
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
