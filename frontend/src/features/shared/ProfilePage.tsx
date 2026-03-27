import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  Lock, 
  BellRing, 
  MessageSquare, 
  ClipboardList,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DEFAULT_AVATAR } from '../../lib/api';

type AuthUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  student_id?: string | null;
  profile_image?: string | null;
};

type ProfilePayload = {
  id: number;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string;
  profile_image?: string | null;
  student_id?: string | null;
  class?: string | null;
  error?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api';

const getGenerationFromStudentId = (id = '') => {
  const matched = id.trim().match(/^(\d{4})-/);
  return matched?.[1] ? `Gen ${matched[1]}` : 'N/A';
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [photoJustUploaded, setPhotoJustUploaded] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    studentId: '',
    className: '',
    generation: 'N/A',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: DEFAULT_AVATAR
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setErrorMessage('');
    if (!authUser?.id) return setErrorMessage('You must login first to edit profile.');

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profileForm.email.trim().toLowerCase();
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
        body: JSON.stringify({ name: fullName, first_name: firstName, last_name: lastName, email })
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
        student_id: profileForm.studentId || authUser.student_id || null,
        profile_image: profileData?.user?.profile_image || authUser.profile_image || profileForm.photoUrl || null
      };
      localStorage.setItem('auth_user', JSON.stringify(updatedAuth));
      localStorage.setItem(`student_notify_${authUser.id}`, JSON.stringify({ remindersEnabled, feedbackEnabled }));
      setAuthUser(updatedAuth);

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
        student_id: parsed?.student_id || null,
        profile_image: parsed?.profile_image || null
      };
      setAuthUser(user);

      const prefsRaw = localStorage.getItem(`student_notify_${userId}`);
      if (prefsRaw) {
        const prefs = JSON.parse(prefsRaw);
        setRemindersEnabled(Boolean(prefs?.remindersEnabled));
        setFeedbackEnabled(Boolean(prefs?.feedbackEnabled));
      }

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
      if (photoJustUploaded) return; // Skip loading if photo was just uploaded
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
        const sid = String(data.student_id || authUser.student_id || '').trim();
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
          studentId: sid,
          className: String(data.class || '').trim(),
          generation: getGenerationFromStudentId(sid)
        }));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load profile.');
      }
    };
    loadProfile();
  }, [authUser, photoJustUploaded]);

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
      setPhotoTimestamp(Date.now()); // Update timestamp to force image refresh
      setPhotoJustUploaded(true); // Mark as just uploaded
      window.dispatchEvent(new Event('profile-photo-updated'));
      setSuccessMessage('Profile photo updated.');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPhotoJustUploaded(false); // Reset flag after showing success message
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile image.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative pb-24 md:pb-0">
        <StudentMobileNav />
        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-0 left-1/2 z-[150] bg-emerald-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-2 md:gap-3 font-bold text-xs md:text-sm whitespace-nowrap"
            >
              <BellRing className="w-4 md:w-5 h-4 md:h-5" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-auto min-h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          <nav className="flex items-center gap-2 text-[10px] md:text-sm text-slate-500 uppercase tracking-widest font-black">
            <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
            <ChevronRight className="w-3.5 h-3.5 opacity-30" />
            <span className="text-slate-900">Settings</span>
          </nav>
          <div className="flex items-center justify-end gap-3 md:gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 md:flex-none bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 uppercase tracking-widest"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
              <p className="text-sm md:text-base text-slate-500 mt-2">Manage your profile and preferences.</p>
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
                  Active Student
                </span>
              </div>
                <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 md:gap-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-24 md:size-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner shrink-0 bg-slate-100">
                      <img src={profileForm.photoUrl ? `${profileForm.photoUrl}?t=${photoTimestamp}` : DEFAULT_AVATAR} alt={profileForm.fullName || 'Student'} className="w-full h-full object-cover" />
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoPick}
                    />
                    <button onClick={() => photoInputRef.current?.click()} className="text-xs md:text-sm font-bold text-primary hover:underline uppercase tracking-widest">Update Photo</button>
                  </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID</label>
                    <input type="text" value={profileForm.studentId || 'N/A'} disabled className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Generation</label>
                    <input type="text" value={profileForm.generation} disabled className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-bold text-sm" />
                  </div>
                  <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Class</label>
                    <input type="text" value={profileForm.className || 'N/A'} disabled className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-bold text-sm" />
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
              <div className="p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                    <input type="password" value={profileForm.currentPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                    <input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm New</label>
                    <input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
                </div>
              </div>
            </motion.section>

            {/* Notification Preferences */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-xs text-slate-500 mt-1">Manage how you receive alerts and updates.</p>
              </div>
              <div className="divide-y divide-slate-50">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Evaluation Reminders</h4>
                      <p className="text-xs text-slate-500">Get notified when an evaluation is about to end.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setRemindersEnabled(!remindersEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      remindersEnabled ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 size-4 bg-white rounded-full transition-all",
                      remindersEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">New Feedback Alerts</h4>
                      <p className="text-xs text-slate-500">Receive an alert when a teacher posts new feedback.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFeedbackEnabled(!feedbackEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      feedbackEnabled ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 size-4 bg-white rounded-full transition-all",
                      feedbackEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-end gap-3 md:gap-4 pt-4">
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
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 uppercase tracking-widest"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


