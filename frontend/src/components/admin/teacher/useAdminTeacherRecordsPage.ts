import { useEffect, useState, useCallback } from "react";
import type {
  TeacherRecord,
  TeacherConfirmAction,
  TeacherEditFormData,
  TeacherToast,
  GenderFilter,
} from "./adminTeacherRecords.types";
import { API_BASE_URL, DEFAULT_AVATAR } from "../../../lib/api";

const EMPTY_EDIT_FORM: TeacherEditFormData = {
  name: "",
  email: "",
  department: "",
  specialization: "",
  phone: "",
};

export function useAdminTeacherRecordsPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<GenderFilter>("All");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] =
    useState<TeacherConfirmAction | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [editTeacher, setEditTeacher] = useState<TeacherRecord | null>(null);
  const [editFormData, setEditFormData] =
    useState<TeacherEditFormData>(EMPTY_EDIT_FORM);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<TeacherToast | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const teacherList = data
            .filter((u: any) => u.role?.toLowerCase() === "teacher")
            .map((u: any) => {
              const genderLower = String(u.gender || "").toLowerCase();
              const gender =
                genderLower === "male"
                  ? "Male"
                  : genderLower === "female"
                    ? "Female"
                    : genderLower === "other"
                      ? "Other"
                      : undefined;
              return {
                id: u.id,
                name:
                  (u.name || "").trim() ||
                  [u.first_name, u.last_name]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                  "Teacher",
                email: u.email,
                status:
                  Number(u.is_deleted) === 1
                    ? "Deleted"
                    : Number(u.is_disable) === 1
                      ? "Inactive"
                      : "Active",
                department: u.department || "Teaching Staff",
                specialization: u.specialization || "General",
                profileImage:
                  String(u.profile_image || "").trim() || DEFAULT_AVATAR,
                joinDate: u.created_at
                  ? new Date(u.created_at).toLocaleDateString()
                  : "N/A",
                phone: u.phone || undefined,
                gender,
              };
            });
          setTeachers(teacherList);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender =
      selectedGender === "All" || t.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  const updateTeacher = useCallback(
    (teacherId: number, changes: Partial<TeacherRecord>) => {
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, ...changes } : t)),
      );
      if (selectedTeacher?.id === teacherId) {
        setSelectedTeacher((prev) => (prev ? { ...prev, ...changes } : null));
      }
      if (editTeacher?.id === teacherId) {
        setEditTeacher((prev) => (prev ? { ...prev, ...changes } : null));
      }
    },
    [],
  );

  const openEditModal = useCallback((teacher: TeacherRecord) => {
    setEditTeacher(teacher);
    setEditFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      specialization: teacher.specialization,
      phone: teacher.phone || "",
    });
  }, []);

  const closeEditModal = useCallback(() => {
    if (!isUpdating) {
      setEditTeacher(null);
      setEditFormData(EMPTY_EDIT_FORM);
    }
  }, [isUpdating]);

  const updateEditField = useCallback(
    <K extends keyof TeacherEditFormData>(
      field: K,
      value: TeacherEditFormData[K],
    ) => {
      setEditFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const requestToggleStatus = useCallback((teacher: TeacherRecord) => {
    setConfirmAction({
      kind: "toggle-active",
      teacher,
      shouldEnable: teacher.status !== "Active",
    });
  }, []);

  const requestDelete = useCallback((teacher: TeacherRecord, hard = false) => {
    setConfirmAction({ kind: hard ? "hard-delete" : "delete", teacher });
  }, []);

  const closeConfirm = useCallback(() => {
    if (!isActionSubmitting) setConfirmAction(null);
  }, [isActionSubmitting]);

  const executeConfirmedAction = useCallback(async () => {
    if (!confirmAction) return;
    setIsActionSubmitting(true);

    try {
      if (confirmAction.kind === "toggle-active" && confirmAction.teacher) {
        const { teacher, shouldEnable } = confirmAction;
        const response = await fetch(
          `${API_BASE_URL}/users/${teacher.id}/active`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: shouldEnable }),
          },
        );
        if (response.ok) {
          updateTeacher(teacher.id, {
            status: shouldEnable ? "Active" : "Inactive",
          });
          setToast({
            message: shouldEnable
              ? `Enabled ${teacher.name}`
              : `Disabled ${teacher.name}`,
            type: "success",
          });
        }
      } else if (confirmAction.kind === "delete" && confirmAction.teacher) {
        const response = await fetch(
          `${API_BASE_URL}/users/${confirmAction.teacher.id}`,
          { method: "DELETE" },
        );
        if (response.ok) {
          setTeachers((prev) =>
            prev.filter((t) => t.id !== confirmAction.teacher!.id),
          );
          if (selectedTeacher?.id === confirmAction.teacher!.id)
            setSelectedTeacher(null);
          setToast({
            message: `Deleted ${confirmAction.teacher!.name}`,
            type: "warning",
          });
        }
      } else if (
        confirmAction.kind === "hard-delete" &&
        confirmAction.teacher
      ) {
        const response = await fetch(
          `${API_BASE_URL}/users/${confirmAction.teacher.id}/hard`,
          { method: "DELETE" },
        );
        if (response.ok) {
          setTeachers((prev) =>
            prev.filter((t) => t.id !== confirmAction.teacher!.id),
          );
          if (selectedTeacher?.id === confirmAction.teacher!.id)
            setSelectedTeacher(null);
          setToast({
            message: `Permanently deleted ${confirmAction.teacher!.name}`,
            type: "warning",
          });
        }
      } else if (confirmAction.kind === "disable-all") {
        const response = await fetch(`${API_BASE_URL}/users/active`, {
          method: "PATCH",
        });
        if (response.ok) {
          setTeachers((prev) =>
            prev.map((t) => ({ ...t, status: "Inactive" })),
          );
          setToast({ message: "All teachers disabled", type: "warning" });
        }
      } else if (confirmAction.kind === "hard-delete-all") {
        const response = await fetch(`${API_BASE_URL}/users/hard-delete`, {
          method: "DELETE",
        });
        if (response.ok) {
          setTeachers([]);
          setSelectedTeacher(null);
          setToast({ message: "Batch deletion complete", type: "warning" });
        }
      }
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionSubmitting(false);
    }
  }, [confirmAction, selectedTeacher, updateTeacher]);

  const saveEdit = useCallback(async () => {
    if (!editTeacher) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${editTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        updateTeacher(editTeacher.id, {
          name: editFormData.name,
          email: editFormData.email,
          department: editFormData.department,
          specialization: editFormData.specialization,
          phone: editFormData.phone || undefined,
        });
        setToast({ message: `Updated ${editFormData.name}`, type: "success" });
        closeEditModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  }, [editTeacher, editFormData, updateTeacher, closeEditModal]);

  const requestDisableAll = useCallback(() => {
    setConfirmAction({ kind: "disable-all" });
  }, []);

  const requestHardDeleteAll = useCallback(() => {
    setConfirmAction({ kind: "hard-delete-all" });
  }, []);

  const setSelected = useCallback((teacher: TeacherRecord | null) => {
    setSelectedTeacher(teacher);
  }, []);

  return {
    // Data
    filteredTeachers,
    teachers,
    isLoading,
    selectedTeacher,
    // Search/Filter
    searchQuery,
    setSearchQuery,
    selectedGender,
    setSelectedGender,
    // Modals
    confirmAction,
    editTeacher,
    editFormData,
    // States
    isActionSubmitting,
    isUpdating,
    toast,
    // Actions
    closeConfirm,
    closeEditModal,
    executeConfirmedAction,
    openEditModal,
    requestDelete,
    requestToggleStatus,
    requestDisableAll,
    requestHardDeleteAll,
    saveEdit,
    setSelected,
    updateEditField,
  };
}
