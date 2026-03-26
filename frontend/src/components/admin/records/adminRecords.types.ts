export type AdminRecordStatus = 'Active' | 'Inactive' | 'Deleted' | 'Pending';

export interface AdminRecord {
  id: number;
  name: string;
  email: string;
  status: AdminRecordStatus;
  role: string;
  accessLevel: string;
  profileImage: string;
  joinDate: string;
  phone: string;
  lastLogin: string;
}

export type AdminRecordConfirmAction =
  | {
      kind: 'hard-delete';
      admin: AdminRecord;
    }
  | {
      kind: 'toggle-active';
      admin: AdminRecord;
      shouldEnable: boolean;
    };

export interface AdminRecordEditFormData {
  name: string;
  email: string;
  role: string;
  accessLevel: string;
  phone: string;
}

export interface AdminRecordToast {
  message: string;
  type: 'success' | 'warning';
}
