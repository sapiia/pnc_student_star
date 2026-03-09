import { useState, useEffect } from 'react';

interface UseProfileDataOptions {
  defaultName?: string;
  defaultPhoto?: string;
}

interface ProfileData {
  profileName: string;
  profilePhoto: string;
}

export function useProfileData({ defaultName = 'User', defaultPhoto = 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg' }: UseProfileDataOptions = {}): ProfileData {
  const [profileName, setProfileName] = useState(defaultName);
  const [profilePhoto, setProfilePhoto] = useState(defaultPhoto);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

    const loadProfileIdentity = async () => {
      try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return;
        
        const authUser = JSON.parse(raw);
        const userId = Number(authUser?.id);
        if (!Number.isInteger(userId) || userId <= 0) return;

        if (authUser?.name) setProfileName(String(authUser.name));
        if (authUser?.profile_image) {
          setProfilePhoto(String(authUser.profile_image));
        } else {
          const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
          if (savedPhoto) setProfilePhoto(savedPhoto);
        }

        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        const data = await response.json();
        if (!response.ok) return;

        setProfileName(
          String(data?.name || '').trim() ||
          [data?.first_name, data?.last_name].filter(Boolean).join(' ').trim() ||
          String(authUser?.name || defaultName)
        );
        
        const resolvedPhoto = String(data?.profile_image || authUser?.profile_image || '').trim();
        if (resolvedPhoto) setProfilePhoto(resolvedPhoto);
      } catch { /* silent fallback */ }
    };

    loadProfileIdentity();

    window.addEventListener('profile-updated', loadProfileIdentity);
    window.addEventListener('profile-photo-updated', loadProfileIdentity);

    return () => {
      window.removeEventListener('profile-updated', loadProfileIdentity);
      window.removeEventListener('profile-photo-updated', loadProfileIdentity);
    };
  }, [defaultName]);

  return { profileName, profilePhoto };
}

