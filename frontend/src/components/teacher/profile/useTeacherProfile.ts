import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, DEFAULT_AVATAR } from '../../../lib/teacher/utils'; // Corrected import path

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

export function useTeacherProfile() {
  const navigate = useNavigate();
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
    department: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photoUrl: DEFAULT_AVATAR,
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

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
  }, [authUser, photoJustUploaded]);

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
      setPhotoTimestamp(Date.now());
      setPhotoJustUploaded(true);
      window.dispatchEvent(new Event('profile-photo-updated'));
      window.dispatchEvent(new Event('profile-updated'));
      setSuccessMessage('Profile photo updated.');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPhotoJustUploaded(false);
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile image.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setProfileForm((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    setErrorMessage('');
  };

  return {
    navigate,
    showSuccess,
    successMessage,
    errorMessage,
    isSaving,
    profileForm,
    setProfileForm,
    photoTimestamp,
    photoInputRef,
    handleSave,
    handlePhotoPick,
    handleDiscardChanges,
  };
}