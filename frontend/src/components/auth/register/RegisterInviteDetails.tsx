import type { InvitePayload } from './types';

type RegisterInviteDetailsProps = {
  inviteData: InvitePayload;
};

export default function RegisterInviteDetails({
  inviteData
}: RegisterInviteDetailsProps) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Invitation Details
      </p>
      <p className="text-sm text-slate-700">
        <span className="font-bold">Role:</span> {inviteData.role}
      </p>
      {inviteData.generation && inviteData.className ? (
        <p className="text-sm text-slate-700">
          <span className="font-bold">Class:</span> Gen {inviteData.generation} -
          {' '}Class {inviteData.className}
        </p>
      ) : null}
      {inviteData.studentId ? (
        <p className="text-sm text-slate-700">
          <span className="font-bold">Student ID:</span> {inviteData.studentId}
        </p>
      ) : null}
    </div>
  );
}
