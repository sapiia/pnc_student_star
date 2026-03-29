import { useEffect, useState } from 'react';
import {
  DEFAULT_AVATAR,
  getTeacherIdFromStorage,
  getTeacherNameFromStorage,
  resolveAvatarUrl,
} from '../lib/teacher/utils';

type UseTeacherIdentityOptions = {
  defaultName?: string;
  defaultAvatar?: string;
};

type TeacherIdentity = {
  teacherId: number | null;
  teacherName: string;
  teacherAvatar: string;
};

const resolveTeacherAvatar = (teacherId: number | null, fallback: string) => {
  let nextAvatar = fallback;
  try {
    const raw = localStorage.getItem('auth_user');
    if (raw) {
      const authUser = JSON.parse(raw);
      const resolvedPhoto = String(authUser?.profile_image || '').trim();
      if (resolvedPhoto) {
        return resolveAvatarUrl(resolvedPhoto, fallback);
      }
    }
    if (teacherId) {
      const savedPhoto = localStorage.getItem(`profile_photo_${teacherId}`);
      if (savedPhoto) {
        return resolveAvatarUrl(savedPhoto, fallback);
      }
    }
  } catch {
    // ignore storage errors
  }
  return nextAvatar;
};

export function useTeacherIdentity(options: UseTeacherIdentityOptions = {}): TeacherIdentity {
  const { defaultName = 'Teacher', defaultAvatar = DEFAULT_AVATAR } = options;
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState(defaultName);
  const [teacherAvatar, setTeacherAvatar] = useState(defaultAvatar);

  useEffect(() => {
    const resolvedTeacherId = getTeacherIdFromStorage();
    setTeacherId(resolvedTeacherId);
    const resolvedTeacherName = getTeacherNameFromStorage();
    const displayName =
      resolvedTeacherName && (resolvedTeacherName !== 'Teacher' || defaultName === 'Teacher')
        ? resolvedTeacherName
        : defaultName;
    setTeacherName(displayName);
    setTeacherAvatar(resolveTeacherAvatar(resolvedTeacherId, defaultAvatar));
  }, [defaultAvatar, defaultName]);

  useEffect(() => {
    const refreshIdentity = () => {
      const resolvedTeacherId = getTeacherIdFromStorage();
      setTeacherId(resolvedTeacherId);
      const resolvedTeacherName = getTeacherNameFromStorage();
      const displayName =
        resolvedTeacherName && (resolvedTeacherName !== 'Teacher' || defaultName === 'Teacher')
          ? resolvedTeacherName
          : defaultName;
      setTeacherName(displayName);
      setTeacherAvatar(resolveTeacherAvatar(resolvedTeacherId, defaultAvatar));
    };

    window.addEventListener('profile-updated', refreshIdentity);
    window.addEventListener('profile-photo-updated', refreshIdentity);
    return () => {
      window.removeEventListener('profile-updated', refreshIdentity);
      window.removeEventListener('profile-photo-updated', refreshIdentity);
    };
  }, [defaultAvatar, defaultName]);

  return { teacherId, teacherName, teacherAvatar };
}
