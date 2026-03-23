import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  DEFAULT_AVATAR,
  getStoredAuthUser,
  resolveAvatarUrl,
  toDisplayName,
} from "../lib/teacher/utils";

type UseTeacherIdentityOptions = {
  defaultName?: string;
  defaultAvatar?: string;
};

type TeacherIdentity = {
  teacherId: number | null;
  teacherName: string;
  teacherAvatar: string;
  isLoading: boolean;
};

const resolveTeacherAvatar = (teacherId: number | null, fallback: string) => {
  let nextAvatar = fallback;
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) {
      const authUser = JSON.parse(raw);
      const resolvedPhoto = String(authUser?.profile_image || "").trim();
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

const getStoredTeacherIdentity = (
  defaultAvatar: string,
): Omit<TeacherIdentity, "isLoading"> | null => {
  const authUser = getStoredAuthUser();
  if (
    !authUser ||
    String(authUser.role || "").trim().toLowerCase() !== "teacher"
  ) {
    return null;
  }

  return {
    teacherId: authUser.id,
    teacherName: toDisplayName(authUser),
    teacherAvatar: resolveTeacherAvatar(authUser.id, defaultAvatar),
  };
};

export function useTeacherIdentity(
  options: UseTeacherIdentityOptions = {},
): TeacherIdentity {
  const { user, loading: authLoading } = useAuth();
  const { defaultName = "Teacher", defaultAvatar = DEFAULT_AVATAR } = options;
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState(defaultName);
  const [teacherAvatar, setTeacherAvatar] = useState(defaultAvatar);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "teacher") {
      setTeacherId(user.id);
      setTeacherName(toDisplayName(user as any));
      setTeacherAvatar(resolveAvatarUrl(user.profile_image, defaultAvatar));
      setIsLoading(false);
      return;
    }

    const storedTeacher = getStoredTeacherIdentity(defaultAvatar);
    if (storedTeacher) {
      setTeacherId(storedTeacher.teacherId);
      setTeacherName(storedTeacher.teacherName);
      setTeacherAvatar(storedTeacher.teacherAvatar);
      setIsLoading(false);
    } else if (authLoading) {
      setIsLoading(true);
    } else {
      setTeacherId(null);
      setTeacherName(defaultName);
      setTeacherAvatar(defaultAvatar);
      setIsLoading(false);
    }
  }, [user, authLoading, defaultAvatar, defaultName]);

  useEffect(() => {
    const refreshIdentity = () => {
      if (user && user.role === "teacher") {
        setTeacherId(user.id);
        setTeacherName(toDisplayName(user as any));
        setTeacherAvatar(resolveAvatarUrl(user.profile_image, defaultAvatar));
        setIsLoading(false);
        return;
      }

      const storedTeacher = getStoredTeacherIdentity(defaultAvatar);
      if (storedTeacher) {
        setTeacherId(storedTeacher.teacherId);
        setTeacherName(storedTeacher.teacherName);
        setTeacherAvatar(storedTeacher.teacherAvatar);
        setIsLoading(false);
      }
    };

    window.addEventListener("profile-updated", refreshIdentity);
    window.addEventListener("profile-photo-updated", refreshIdentity);
    return () => {
      window.removeEventListener("profile-updated", refreshIdentity);
      window.removeEventListener("profile-photo-updated", refreshIdentity);
    };
  }, [defaultAvatar, defaultName, user]);

  return { teacherId, teacherName, teacherAvatar, isLoading };
}
