export type InvitePayload = {
  email: string;
  role: string;
  firstName?: string;
  lastName?: string | null;
  name?: string;
  generation?: string | null;
  className?: string | null;
  studentId?: string | null;
  expiresAt?: number;
};
