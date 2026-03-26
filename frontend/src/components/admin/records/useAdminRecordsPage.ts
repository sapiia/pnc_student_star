import { useEffect, useState } from "react";

import type { ApiUserRecord } from "../dashboard/adminDashboard.types";
import type {
  AdminRecord,
  AdminRecordConfirmAction,
  AdminRecordEditFormData,
  AdminRecordToast,
} from "./adminRecords.types";
import {
  API_BASE_URL,
  DEFAULT_AVATAR,
  resolveAvatarUrl,
} from "../../../lib/api";

interface ApiAdminUserRecord extends ApiUserRecord {
  access_level?: string;
  admin_role?: string;
  created_at?: string;
  last_login?: string;
  phone?: string;
  profile_image?: string;
}

const EMPTY_EDIT_FORM: AdminRecordEditFormData = {
  name: "",
  email: "",
  role: "",
  accessLevel: "Full Access",
  phone: "",
};

export function useAdminRecordsPage() {
  const [admins, setAdmins] = useState([] as AdminRecord[]);
  const [authAdminId, setAuthAdminId] = useState(null as number | null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(
    null as AdminRecord | null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(
    null as AdminRecordConfirmAction | null,
  );
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState(null as AdminRecord | null);
  const [editFormData, setEditFormData] = useState(
    EMPTY_EDIT_FORM as AdminRecordEditFormData,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null as AdminRecordToast | null);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok) {
          throw new Error("Failed to load admin records.");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setAdmins(
            data
              .filter(
                (user: ApiAdminUserRecord) =>
                  String(user.role || "").toLowerCase() === "admin",
              )
              .map((user: ApiAdminUserRecord) => mapUserToAdminRecord(user)),
          );
          return;
        }

        setAdmins([]);
      } catch (error) {
        console.error(error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAdmins();
    setAuthAdminId(getStoredAuthAdminId());
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const filteredAdmins = admins.filter((admin) => {
    const query = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      admin.role.toLowerCase().includes(query)
    );
  });

  const isSelfAdmin = (adminId?: number) =>
    Number.isInteger(adminId) &&
    Number(adminId) > 0 &&
    authAdminId != null &&
    Number(adminId) === authAdminId;

  const openEditModal = (admin: AdminRecord) => {
    setEditTarget(admin);
    setEditFormData({
      accessLevel: admin.accessLevel,
      email: admin.email,
      name: admin.name,
      phone: admin.phone === "N/A" ? "" : admin.phone,
      role: admin.role,
    });
  };

  const closeEditModal = () => {
    if (isUpdating) {
      return;
    }

    setEditTarget(null);
    setEditFormData(EMPTY_EDIT_FORM);
  };

  const updateEditFormField = <K extends keyof AdminRecordEditFormData>(
    field: K,
    value: AdminRecordEditFormData[K],
  ) => {
    setEditFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const requestDeleteAdmin = (admin: AdminRecord) => {
    const guardMessage = getDeleteGuardMessage(admin, admins, authAdminId);
    if (guardMessage) {
      alert(guardMessage);
      return;
    }

    setConfirmAction({
      kind: "hard-delete",
      admin,
    });
  };

  const requestToggleAdminStatus = (admin: AdminRecord) => {
    const shouldEnable = admin.status !== "Active";
    const guardMessage = getToggleGuardMessage(
      admin,
      shouldEnable,
      admins,
      authAdminId,
    );

    if (guardMessage) {
      alert(guardMessage);
      return;
    }

    setConfirmAction({
      kind: "toggle-active",
      admin,
      shouldEnable,
    });
  };

  const closeConfirmAction = () => {
    if (!isActionSubmitting) {
      setConfirmAction(null);
    }
  };

  const updateAdmin = (adminId: number, changes: Partial<AdminRecord>) => {
    setAdmins((current) =>
      current.map((admin) =>
        admin.id === adminId ? { ...admin, ...changes } : admin,
      ),
    );
    setSelectedAdmin((current) =>
      current?.id === adminId ? { ...current, ...changes } : current,
    );
    setEditTarget((current) =>
      current?.id === adminId ? { ...current, ...changes } : current,
    );
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) {
      return;
    }

    setIsActionSubmitting(true);

    try {
      if (confirmAction.kind === "toggle-active") {
        const { admin, shouldEnable } = confirmAction;
        const response = await fetch(
          `${API_BASE_URL}/users/${admin.id}/active`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: shouldEnable }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update admin status.");
        }

        updateAdmin(admin.id, {
          status: shouldEnable ? "Active" : "Inactive",
        });
        setToast({
          message: shouldEnable
            ? `Enabled ${admin.name}`
            : `Disabled ${admin.name}`,
          type: "success",
        });
      }

      if (confirmAction.kind === "hard-delete") {
        const { admin } = confirmAction;
        const response = await fetch(`${API_BASE_URL}/users/${admin.id}/hard`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to permanently delete admin.");
        }

        setAdmins((current) => current.filter((item) => item.id !== admin.id));
        setSelectedAdmin((current) =>
          current?.id === admin.id ? null : current,
        );
        setEditTarget((current) => (current?.id === admin.id ? null : current));
        setToast({
          message: `Permanently deleted ${admin.name}`,
          type: "warning",
        });
      }

      setConfirmAction(null);
    } catch (error) {
      console.error(error);
      alert("Communication error.");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const saveEdit = async () => {
    if (!editTarget) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_level: editFormData.accessLevel,
          admin_role: editFormData.role,
          email: editFormData.email,
          name: editFormData.name,
          phone: editFormData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update admin.");
      }

      updateAdmin(editTarget.id, {
        accessLevel: editFormData.accessLevel,
        email: editFormData.email,
        name: editFormData.name,
        phone: editFormData.phone || "N/A",
        role: editFormData.role,
      });
      setToast({
        message: `Updated ${editFormData.name}`,
        type: "success",
      });
      setEditTarget(null);
      setEditFormData(EMPTY_EDIT_FORM);
    } catch (error) {
      console.error(error);
      alert("Communication error.");
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    closeConfirmAction,
    closeEditModal,
    confirmAction,
    editFormData,
    editTarget,
    executeConfirmedAction,
    filteredAdmins,
    isActionSubmitting,
    isLoading,
    isSelfAdmin,
    isUpdating,
    openEditModal,
    requestDeleteAdmin,
    requestToggleAdminStatus,
    saveEdit,
    searchQuery,
    selectedAdmin,
    setSearchQuery,
    setSelectedAdmin,
    toast,
    updateEditFormField,
  };
}

function getStoredAuthAdminId() {
  try {
    const raw = localStorage.getItem("auth_user");
    const parsed = raw ? JSON.parse(raw) : null;
    const userId = Number(parsed?.id);

    if (Number.isInteger(userId) && userId > 0) {
      return userId;
    }
  } catch {
    return null;
  }

  return null;
}

function getDeleteGuardMessage(
  admin: AdminRecord,
  admins: AdminRecord[],
  authAdminId: number | null,
) {
  if (admin.id === authAdminId) {
    return "You cannot delete your own admin account.";
  }

  if (admins.length <= 1) {
    return "Cannot delete the only admin account.";
  }

  return null;
}

function getToggleGuardMessage(
  admin: AdminRecord,
  shouldEnable: boolean,
  admins: AdminRecord[],
  authAdminId: number | null,
) {
  if (admin.id === authAdminId) {
    return "You cannot disable your own admin account.";
  }

  if (
    !shouldEnable &&
    admins.filter((item) => item.status === "Active").length <= 1
  ) {
    return "Cannot disable the last active admin.";
  }

  return null;
}

function mapUserToAdminRecord(user: ApiAdminUserRecord): AdminRecord {
  return {
    accessLevel: user.access_level || "Full Access",
    email: user.email,
    id: user.id,
    joinDate: user.created_at
      ? new Date(user.created_at).toLocaleDateString()
      : "N/A",
    lastLogin: user.last_login
      ? new Date(user.last_login).toLocaleDateString()
      : "Never",
    name:
      String(user.name || "").trim() ||
      [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
      "Admin",
    phone: String(user.phone || "").trim() || "N/A",
    profileImage: resolveAvatarUrl(user.profile_image, DEFAULT_AVATAR),
    role: user.admin_role || "System Administrator",
    status:
      Number(user.is_deleted) === 1
        ? "Deleted"
        : Number(user.is_disable) === 1
          ? "Inactive"
          : "Active",
  };
}
