import { Eye, Minus, Pencil, Plus, Trash2 } from 'lucide-react';

import { cn } from '../../../lib/utils';

import type { AdminRecord } from './adminRecords.types';

interface AdminRecordsTableProps {
  admins: AdminRecord[];
  isLoading: boolean;
  selectedAdminId: number | null;
  onDeleteAdmin: (admin: AdminRecord) => void;
  onEditAdmin: (admin: AdminRecord) => void;
  onSelectAdmin: (admin: AdminRecord) => void;
  onToggleAdminStatus: (admin: AdminRecord) => void;
  isSelfAdmin: (adminId?: number) => boolean;
}

export default function AdminRecordsTable({
  admins,
  isLoading,
  selectedAdminId,
  onDeleteAdmin,
  onEditAdmin,
  onSelectAdmin,
  onToggleAdminStatus,
  isSelfAdmin,
}: AdminRecordsTableProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50">
            <tr className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <th className="px-6 py-4">Administrator</th>
              <th className="hidden px-6 py-4 md:table-cell">Role</th>
              <th className="hidden px-6 py-4 md:table-cell">Access Level</th>
              <th className="hidden px-6 py-4 text-center sm:table-cell">
                Status
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm font-bold text-slate-400"
                >
                  Loading administrators...
                </td>
              </tr>
            ) : null}

            {!isLoading && admins.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm font-bold text-slate-400"
                >
                  No administrators match your search.
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? admins.map((admin) => {
                  const isSelf = isSelfAdmin(admin.id);
                  const isActive = admin.status === 'Active';

                  return (
                    <tr
                      key={admin.id}
                      onClick={() => onSelectAdmin(admin)}
                      className={cn(
                        'group cursor-pointer transition-colors hover:bg-slate-50',
                        selectedAdminId === admin.id ? 'bg-primary/5' : '',
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                            <img
                              src={admin.profileImage}
                              alt={admin.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {admin.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className="text-xs font-bold text-slate-600">
                          {admin.role}
                        </span>
                      </td>

                      <td className="hidden px-6 py-4 md:table-cell">
                        <span className="text-xs font-bold text-slate-600">
                          {admin.accessLevel}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-1 text-[10px] font-black tracking-wider uppercase',
                            isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-400',
                          )}
                        >
                          {admin.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectAdmin(admin);
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditAdmin(admin);
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary"
                            title="Edit Admin"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleAdminStatus(admin);
                            }}
                            className={cn(
                              'rounded-lg p-2 transition-colors',
                              isActive
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-emerald-500 hover:bg-emerald-50',
                              isSelf ? 'cursor-not-allowed opacity-50' : '',
                            )}
                            disabled={isSelf}
                            title={isActive ? 'Disable Admin' : 'Enable Admin'}
                          >
                            {isActive ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteAdmin(admin);
                            }}
                            className={cn(
                              'rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500',
                              isSelf ? 'cursor-not-allowed opacity-50' : '',
                            )}
                            disabled={isSelf}
                            title={
                              isSelf
                                ? 'You cannot delete your own account'
                                : 'Delete Admin'
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Showing {admins.length} administrators
        </p>
      </div>
    </div>
  );
}
