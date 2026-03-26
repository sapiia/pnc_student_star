import { useEffect, useRef, useState } from "react";

import type {
  AuthUser,
  BooleanRolePermissionKey,
  CriterionFormState,
  CriterionSetting,
  ProfileFormState,
  RolePermissionSettings,
  SettingsTab,
} from "./adminSettings.types";
import {
  API_BASE_URL,
  CRITERION_ICON_OPTIONS,
  DEFAULT_CRITERIA_SETTINGS,
  DEFAULT_EVALUATION_INTERVAL_DAYS,
  DEFAULT_NOTIFICATION_RETENTION_DAYS,
  DEFAULT_PROFILE_FORM,
  DEFAULT_RATING_SCALE,
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_PERMISSION_SETTING_CONFIGS,
  buildDefaultStarDescriptions,
  createEmptyCriterionDraft,
  formatIntervalMonths,
  getAuthUserFromStorage,
  normalizeCriterionSettings,
  normalizeStarDescriptions,
  parseBooleanSetting,
  parseNumberSetting,
  splitNameParts,
  toRoleLabel,
} from "./adminSettings.utils";

const readJsonSafely = async (response: Response) => {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const getNextCriterionId = (criteriaList: CriterionSetting[]) => {
  const nextNumber =
    criteriaList.reduce((max, criterion) => {
      const match = /^CRIT-(\d+)$/.exec(criterion.id);
      return Math.max(max, match ? Number(match[1]) : 0);
    }, 0) + 1;

  return `CRIT-${String(nextNumber).padStart(3, "0")}`;
};

export function useAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("system" as SettingsTab);
  const [criteriaList, setCriteriaList] = useState(
    DEFAULT_CRITERIA_SETTINGS as CriterionSetting[],
  );
  const [ratingScale, setRatingScale] = useState(DEFAULT_RATING_SCALE);
  const [evaluationIntervalDays, setEvaluationIntervalDays] = useState(
    DEFAULT_EVALUATION_INTERVAL_DAYS,
  );
  const [notificationRetentionDays, setNotificationRetentionDays] = useState(
    DEFAULT_NOTIFICATION_RETENTION_DAYS,
  );
  const [rolePermissions, setRolePermissions] =
    useState(DEFAULT_ROLE_PERMISSIONS as RolePermissionSettings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [editingCriterionId, setEditingCriterionId] = useState(
    null as string | null,
  );
  const [newCrit, setNewCrit] = useState(
    createEmptyCriterionDraft() as CriterionFormState,
  );
  const [newCritStarDescriptions, setNewCritStarDescriptions] = useState(
    buildDefaultStarDescriptions("criterion") as string[],
  );
  const [criterionPendingDelete, setCriterionPendingDelete] =
    useState(null as CriterionSetting | null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Settings saved successfully!",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [authUser, setAuthUser] = useState(null as AuthUser | null);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());
  const [photoJustUploaded, setPhotoJustUploaded] = useState(false);
  const [profileForm, setProfileForm] = useState(
    DEFAULT_PROFILE_FORM as ProfileFormState,
  );

  const photoInputRef = useRef(null as HTMLInputElement | null);
  const successTimeoutRef = useRef(null as number | null);

  const filteredCriterionIconOptions = CRITERION_ICON_OPTIONS.filter((option) => {
    const query = iconSearchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  });

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current);
    }

    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const resetCriterionForm = () => {
    setEditingCriterionId(null);
    setNewCrit(createEmptyCriterionDraft());
    setNewCritStarDescriptions(buildDefaultStarDescriptions("criterion"));
    setIconSearchQuery("");
  };

  const closeCriterionModal = () => {
    resetCriterionForm();
    setShowAddModal(false);
  };

  const openAddCriterionModal = () => {
    resetCriterionForm();
    setShowAddModal(true);
  };

  const openEditCriterionModal = (criterion: CriterionSetting) => {
    setEditingCriterionId(criterion.id);
    setNewCrit({
      description: criterion.description,
      icon: criterion.icon,
      name: criterion.name,
    });
    setNewCritStarDescriptions(
      normalizeStarDescriptions(
        criterion.name,
        criterion.starDescriptions,
        ratingScale,
      ),
    );
    setIconSearchQuery("");
    setShowAddModal(true);
  };

  const updateRolePermission = <K extends keyof RolePermissionSettings>(
    key: K,
    value: RolePermissionSettings[K],
  ) => {
    setRolePermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleRolePermission = (key: BooleanRolePermissionKey) => {
    setRolePermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleStudentMultipleEvaluations = () => {
    setRolePermissions((prev) => ({
      ...prev,
      studentMaxEvaluationsPerCycle:
        prev.studentMaxEvaluationsPerCycle > 1
          ? 1
          : Math.max(prev.studentMaxEvaluationsPerCycle, 2),
    }));
  };

  const updateProfileField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setProfileForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateCriterionDraft = <K extends keyof CriterionFormState>(
    key: K,
    value: CriterionFormState[K],
  ) => {
    setNewCrit((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateCriterionStarDescription = (index: number, value: string) => {
    setNewCritStarDescriptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSaveCriterion = () => {
    if (!newCrit.name.trim()) {
      return;
    }

    const criterionPayload: CriterionSetting = {
      description: newCrit.description.trim(),
      icon: newCrit.icon || "Sparkles",
      id: editingCriterionId || getNextCriterionId(criteriaList),
      name: newCrit.name.trim(),
      starDescriptions: newCritStarDescriptions.map((description) =>
        description.trim(),
      ),
      status: "Active",
    };

    setCriteriaList((prev) =>
      editingCriterionId
        ? prev.map((criterion) =>
            criterion.id === editingCriterionId ? criterionPayload : criterion,
          )
        : [...prev, criterionPayload],
    );

    closeCriterionModal();
  };

  const handleDeleteCriterion = (criterion: CriterionSetting) => {
    setCriterionPendingDelete(criterion);
  };

  const confirmDeleteCriterion = () => {
    if (!criterionPendingDelete) {
      return;
    }

    setCriteriaList((prev) =>
      prev.filter((criterion) => criterion.id !== criterionPendingDelete.id),
    );
    setCriterionPendingDelete(null);
  };

  const saveSystemSettings = async () => {
    const criteriaPayload = criteriaList.map((criterion, index) => ({
      description: criterion.description.trim(),
      displayOrder: index + 1,
      icon: criterion.icon,
      id: criterion.id,
      name: criterion.name.trim(),
      starDescriptions: normalizeStarDescriptions(
        criterion.name,
        criterion.starDescriptions,
        ratingScale,
      ).map((description) => description.trim()),
      status: criterion.status,
    }));

    const permissionRequests = ROLE_PERMISSION_SETTING_CONFIGS.map((config) =>
      fetch(`${API_BASE_URL}/settings/key/${config.endpoint}`, {
        body: JSON.stringify({
          value: String(rolePermissions[config.key]),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
    );

    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/settings/evaluation-criteria`, {
        body: JSON.stringify({
          criteria: criteriaPayload,
          ratingScale,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
      fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`, {
        body: JSON.stringify({
          value: String(evaluationIntervalDays),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
      fetch(`${API_BASE_URL}/settings/key/notification_auto_delete_days`, {
        body: JSON.stringify({
          value: String(notificationRetentionDays),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
      ...permissionRequests,
    ]);

    const payloads = await Promise.all(responses.map(readJsonSafely));
    const [criteriaResponse, intervalResponse, notificationResponse, ...permissionResponses] =
      responses;
    const [criteriaData, intervalData, notificationData, ...permissionPayloads] =
      payloads;

    if (!criteriaResponse.ok) {
      throw new Error(
        String(criteriaData.error || "Failed to save criteria configuration."),
      );
    }
    if (!intervalResponse.ok) {
      throw new Error(
        String(intervalData.error || "Failed to save evaluation interval."),
      );
    }
    if (!notificationResponse.ok) {
      throw new Error(
        String(
          notificationData.error || "Failed to save notification retention.",
        ),
      );
    }

    ROLE_PERMISSION_SETTING_CONFIGS.forEach((config, index) => {
      if (!permissionResponses[index]?.ok) {
        throw new Error(
          String(
            permissionPayloads[index]?.error || config.saveErrorMessage,
          ),
        );
      }
    });

    const nextRatingScale = Math.max(
      1,
      Number(criteriaData.ratingScale || ratingScale),
    );
    setRatingScale(nextRatingScale);
    setCriteriaList(normalizeCriterionSettings(criteriaData.criteria, nextRatingScale));
    showSuccessToast(
      "Criteria, interval, and role permissions saved successfully!",
    );
    window.dispatchEvent(new Event("student-settings-updated"));
  };

  const saveProfileSettings = async () => {
    if (!authUser?.id) {
      setErrorMessage("You must login first to edit profile.");
      return;
    }

    const firstName = profileForm.firstName.trim();
    const lastName = profileForm.lastName.trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = profileForm.email.trim().toLowerCase();
    const department = profileForm.department.trim();
    const shouldChangePassword = Boolean(
      profileForm.currentPassword.trim() ||
        profileForm.newPassword.trim() ||
        profileForm.confirmPassword.trim(),
    );

    if (!firstName) {
      setErrorMessage("First name is required.");
      return;
    }
    if (!lastName) {
      setErrorMessage("Last name is required.");
      return;
    }
    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Invalid email format.");
      return;
    }
    if (shouldChangePassword) {
      if (
        !profileForm.currentPassword ||
        !profileForm.newPassword ||
        !profileForm.confirmPassword
      ) {
        setErrorMessage(
          "Please fill current, new, and confirm password fields.",
        );
        return;
      }
      if (profileForm.newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters.");
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }
    }

    const profileResponse = await fetch(
      `${API_BASE_URL}/users/${authUser.id}/profile`,
      {
        body: JSON.stringify({
          department,
          email,
          first_name: firstName,
          last_name: lastName,
          name: fullName,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      },
    );
    const profileData = await readJsonSafely(profileResponse);

    if (!profileResponse.ok) {
      throw new Error(String(profileData.error || "Failed to update profile."));
    }

    if (shouldChangePassword) {
      const passwordResponse = await fetch(
        `${API_BASE_URL}/users/${authUser.id}/password`,
        {
          body: JSON.stringify({
            current_password: profileForm.currentPassword,
            new_password: profileForm.newPassword,
          }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        },
      );
      const passwordData = await readJsonSafely(passwordResponse);

      if (!passwordResponse.ok) {
        throw new Error(
          String(passwordData.error || "Failed to change password."),
        );
      }
    }

    const userPayload = (profileData.user as Record<string, unknown>) || {};
    const updatedUser: AuthUser = {
      email: String(userPayload.email || email),
      id: authUser.id,
      name: String(userPayload.name || fullName),
      profile_image:
        String(
          userPayload.profile_image ||
            authUser.profile_image ||
            profileForm.photoUrl ||
            "",
        ).trim() || null,
      role: String(userPayload.role || authUser.role || "admin"),
    };

    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setAuthUser(updatedUser);
    window.dispatchEvent(new Event("profile-updated"));

    setProfileForm((prev) => ({
      ...prev,
      confirmPassword: "",
      currentPassword: "",
      department,
      email: updatedUser.email || "",
      firstName,
      lastName,
      newPassword: "",
      roleLabel: toRoleLabel(updatedUser.role || "admin"),
    }));

    showSuccessToast(
      shouldChangePassword
        ? "Profile and password updated successfully!"
        : "Profile updated successfully!",
    );
  };

  const handleSave = async () => {
    setErrorMessage("");
    setIsSaving(true);

    try {
      if (activeTab === "system") {
        await saveSystemSettings();
      } else {
        await saveProfileSettings();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoPick = async (
    event: any,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${API_BASE_URL}/users/${authUser.id}/profile-image`,
        {
          body: formData,
          method: "PATCH",
        },
      );
      const rawText = await response.text();
      let data: Record<string, unknown> = {};

      try {
        data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
      } catch {
        data = { error: rawText || "Server returned an invalid response." };
      }

      if (!response.ok) {
        throw new Error(String(data.error || "Failed to update profile image."));
      }

      const user = (data.user as Record<string, unknown>) || {};
      const updatedPhoto = String(user.profile_image || "").trim();
      if (!updatedPhoto) {
        throw new Error("Profile image was not returned by server.");
      }

      const updatedUser: AuthUser = {
        ...(authUser || { id: 0 }),
        email: String(user.email || authUser?.email || ""),
        name: String(user.name || authUser?.name || ""),
        profile_image: updatedPhoto,
        role: String(user.role || authUser?.role || "admin"),
      };

      setAuthUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
      localStorage.setItem(`profile_photo_${authUser.id}`, updatedPhoto);
      setProfileForm((prev) => ({ ...prev, photoUrl: updatedPhoto }));
      setPhotoTimestamp(Date.now());
      setPhotoJustUploaded(true);
      window.dispatchEvent(new Event("profile-photo-updated"));
      window.dispatchEvent(new Event("profile-updated"));
      showSuccessToast("Profile photo updated.");
      window.setTimeout(() => setPhotoJustUploaded(false), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update profile image.",
      );
    } finally {
      event.target.value = "";
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setAuthUser(getAuthUserFromStorage());
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadSystemSettings = async () => {
      setIsLoadingCriteria(true);

      try {
        const permissionResponsesPromise = Promise.all(
          ROLE_PERMISSION_SETTING_CONFIGS.map((config) =>
            fetch(`${API_BASE_URL}/settings/key/${config.endpoint}`),
          ),
        );

        const [criteriaResponse, intervalResponse, notificationResponse, permissionResponses] =
          await Promise.all([
            fetch(`${API_BASE_URL}/settings/evaluation-criteria`),
            fetch(`${API_BASE_URL}/settings/key/evaluation_interval_days`),
            fetch(`${API_BASE_URL}/settings/key/notification_auto_delete_days`),
            permissionResponsesPromise,
          ]);

        const [criteriaData, intervalData, notificationData, permissionPayloads] =
          await Promise.all([
            readJsonSafely(criteriaResponse),
            readJsonSafely(intervalResponse),
            readJsonSafely(notificationResponse),
            Promise.all(permissionResponses.map(readJsonSafely)),
          ]);

        if (!criteriaResponse.ok) {
          throw new Error(
            String(
              criteriaData.error || "Failed to load criteria configuration.",
            ),
          );
        }

        const nextRatingScale = Math.max(
          1,
          Number(criteriaData.ratingScale || DEFAULT_RATING_SCALE),
        );
        setRatingScale(nextRatingScale);
        setCriteriaList(
          normalizeCriterionSettings(criteriaData.criteria, nextRatingScale),
        );
        setEvaluationIntervalDays(
          intervalResponse.ok
            ? parseNumberSetting(
                intervalData.value,
                DEFAULT_EVALUATION_INTERVAL_DAYS,
                30,
                365,
              )
            : DEFAULT_EVALUATION_INTERVAL_DAYS,
        );
        setNotificationRetentionDays(
          notificationResponse.ok
            ? parseNumberSetting(
                notificationData.value,
                DEFAULT_NOTIFICATION_RETENTION_DAYS,
                7,
                365,
              )
            : DEFAULT_NOTIFICATION_RETENTION_DAYS,
        );
        const nextPermissions = {
          ...DEFAULT_ROLE_PERMISSIONS,
        } as RolePermissionSettings;
        const nextPermissionsRecord = nextPermissions as Record<
          string,
          boolean | number
        >;

        ROLE_PERMISSION_SETTING_CONFIGS.forEach((config, index) => {
          const response = permissionResponses[index];
          const data = permissionPayloads[index];
          const fallback = DEFAULT_ROLE_PERMISSIONS[config.key];

          if (!response?.ok) {
            nextPermissionsRecord[config.key] = fallback;
            return;
          }

          nextPermissionsRecord[config.key] =
            config.type === "boolean"
              ? parseBooleanSetting(data.value, fallback as boolean)
              : parseNumberSetting(
                  data.value,
                  fallback as number,
                  config.min ?? 0,
                  config.max ?? Number.MAX_SAFE_INTEGER,
                );
        });

        setRolePermissions(nextPermissions);
      } catch (error) {
        setRatingScale(DEFAULT_RATING_SCALE);
        setCriteriaList(
          normalizeCriterionSettings(
            DEFAULT_CRITERIA_SETTINGS,
            DEFAULT_RATING_SCALE,
          ),
        );
        setEvaluationIntervalDays(DEFAULT_EVALUATION_INTERVAL_DAYS);
        setNotificationRetentionDays(DEFAULT_NOTIFICATION_RETENTION_DAYS);
        setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load criteria configuration.",
        );
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    loadSystemSettings();
  }, []);

  useEffect(() => {
    if (!showAddModal) {
      return;
    }

    if (!newCrit.icon) {
      setNewCrit((prev) => ({ ...prev, icon: "Sparkles" }));
    }
  }, [newCrit.icon, showAddModal]);

  useEffect(() => {
    setCriteriaList((prev) =>
      prev.map((criterion) => ({
        ...criterion,
        starDescriptions: normalizeStarDescriptions(
          criterion.name,
          criterion.starDescriptions,
          ratingScale,
        ),
      })),
    );
    setNewCritStarDescriptions((prev) =>
      normalizeStarDescriptions(newCrit.name || "criterion", prev, ratingScale),
    );
  }, [newCrit.name, ratingScale]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authUser?.id || photoJustUploaded) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${authUser.id}/profile`);
        const data = await readJsonSafely(response);

        if (!response.ok) {
          throw new Error(String(data.error || "Failed to load profile."));
        }

        const savedPhoto =
          String(data.profile_image || authUser.profile_image || "").trim() ||
          localStorage.getItem(`profile_photo_${authUser.id}`) ||
          DEFAULT_PROFILE_FORM.photoUrl;
        const resolvedFirstName = String(data.first_name || "").trim();
        const resolvedLastName = String(data.last_name || "").trim();
        const fallbackName = splitNameParts(String(data.name || authUser.name || ""));

        setProfileForm((prev) => ({
          ...prev,
          department: String(data.department || ""),
          email: String(data.email || authUser.email || ""),
          firstName: resolvedFirstName || fallbackName.firstName,
          lastName: resolvedLastName || fallbackName.lastName,
          photoUrl: savedPhoto,
          roleLabel: toRoleLabel(String(data.role || authUser.role || "admin")),
        }));
      } catch (error) {
        const fallbackPhoto =
          String(authUser.profile_image || "").trim() ||
          localStorage.getItem(`profile_photo_${authUser.id}`) ||
          DEFAULT_PROFILE_FORM.photoUrl;
        const fallbackName = splitNameParts(authUser.name || "");

        setProfileForm((prev) => ({
          ...prev,
          email: authUser.email || "",
          firstName: fallbackName.firstName,
          lastName: fallbackName.lastName,
          photoUrl: fallbackPhoto,
          roleLabel: toRoleLabel(authUser.role || "admin"),
        }));
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load profile.",
        );
      }
    };

    loadProfile();
  }, [authUser, photoJustUploaded]);

  return {
    activeTab,
    closeCriterionModal,
    confirmDeleteCriterion,
    criteriaList,
    criterionPendingDelete,
    editingCriterionId,
    errorMessage,
    evaluationIntervalDays,
    filteredCriterionIconOptions,
    formattedIntervalMonths: formatIntervalMonths(evaluationIntervalDays),
    handleDeleteCriterion,
    handlePhotoPick,
    handleSave,
    handleSaveCriterion,
    iconSearchQuery,
    isLoadingCriteria,
    isSaving,
    newCrit,
    newCritStarDescriptions,
    notificationRetentionDays,
    openAddCriterionModal,
    openEditCriterionModal,
    photoInputRef,
    photoTimestamp,
    profileForm,
    ratingScale,
    rolePermissions,
    setActiveTab,
    setCriterionPendingDelete,
    setEvaluationIntervalDays,
    setIconSearchQuery,
    setNotificationRetentionDays,
    setRatingScale,
    showAddModal,
    showSuccess,
    successMessage,
    toggleRolePermission,
    toggleStudentMultipleEvaluations,
    updateCriterionDraft,
    updateCriterionStarDescription,
    updateProfileField,
    updateRolePermission,
  };
}
