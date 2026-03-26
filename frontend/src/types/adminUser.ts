export type UserRole = "Student" | "Teacher" | "Admin";

export type UserStatus = "Active" | "Inactive" | "Pending" | "Deleted";

export type StudentGeneration = string;
export type StudentMajor = string;
export type Gender = "male" | "female";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  group: string;
  status: UserStatus;
  initials: string;
  color: string;
  profileImage?: string;
  studentId?: string;
  generation?: StudentGeneration;
  className?: string;
  major?: StudentMajor;
  gender?: Gender;
}

export interface ApiUser {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  profile_image?: string | null;
  role: string;
  class?: string | null;
  student_id?: string | null;
  resolved_student_id?: string | null;
  is_active?: number | boolean | null;
  is_disable?: number | boolean | null;
  is_deleted?: number | boolean | null;
  is_registered?: number | boolean | null;
  account_status?: string;
  registration_status?: string;
  gender?: string | null;
  generation?: string | null;
  className?: string | null;
  major?: string | null;
}

export interface BulkInvitedUser {
  row?: number;
  name: string;
  email: string;
  role: string;
  gender?: string;
  group?: string;
  generation?: string | null;
  className?: string | null;
  major?: string | null;
  studentId?: string | null;
}

export interface BulkExistingUser {
  row: number;
  name: string;
  email: string;
}

export interface BulkValidatedRow {
  row: number;
  payload: {
    firstName: string;
    lastName?: string;
    email: string;
    gender: string;
    role: string;
    generation?: string | null;
    className?: string | null;
    major?: string | null;
    studentId?: string | null;
  };
}

export type ConfirmAction =
  | {
      kind: "toggle-active";
      user: UserRecord;
      shouldEnable: boolean;
    }
  | {
      kind: "delete";
      user: UserRecord;
    }
  | {
      kind: "hard-delete";
      user: UserRecord;
    }
  | {
      kind: "delete-all";
    }
  | {
      kind: "disable-all";
    }
  | {
      kind: "hard-delete-all";
    };

export interface NewUserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  generation: StudentGeneration;
  major: StudentMajor;
  className: string;
  studentId: string;
  gender: Gender;
  status: UserStatus;
}
