import { DEFAULT_AVATAR } from "../../../lib/api";

export interface TeacherRecord {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Inactive" | "Deleted" | "Pending";
  department: string;
  specialization: string;
  profileImage: string;
  joinDate: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other";
}

export type TeacherConfirmAction = {
  kind:
    | "delete"
    | "hard-delete"
    | "toggle-active"
    | "disable-all"
    | "hard-delete-all";
  teacher?: TeacherRecord;
  shouldEnable?: boolean;
};

export interface TeacherEditFormData {
  name: string;
  email: string;
  department: string;
  specialization: string;
  phone: string;
}

export type TeacherToast = {
  message: string;
  type: "success" | "warning";
};

export type GenderFilter = "All" | "Male" | "Female" | "Other";
