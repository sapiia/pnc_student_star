import { ArrowUpDown, Edit2, Filter, Plus } from 'lucide-react';

import { cn } from '../../../lib/utils';

import type {
  DashboardSortBy,
  DashboardSortOrder,
  PendingUser,
} from './adminDashboard.types';

interface PendingUsersCardProps {
  users: PendingUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  sortBy: DashboardSortBy;
  sortOrder: DashboardSortOrder;
  onSortByChange: (value: DashboardSortBy) => void;
  onSortOrderChange: (value: DashboardSortOrder) => void;
  onAddUser: () => void;
  onEditUser: (userId: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const STATUS_STYLES = {
  Active: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Deleted: 'bg-rose-50 text-rose-600',
  Inactive: 'bg-slate-100 text-slate-400',
} as const;

export default function PendingUsersCard({
  users,
  totalUsers,
  currentPage,
  totalPages,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onAddUser,
  onEditUser,
  onPreviousPage,
  onNextPage,
}: PendingUsersCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-4">
          <h3 className="font-black text-slate-900">Pending users</h3>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(event) => onSortByChange(event.target.value as DashboardSortBy)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="generation">Generation</option>
              <option value="name">Name</option>
              <option value="created_at">Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value as DashboardSortOrder)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="desc">DESC</option>
              <option value="asc">ASC</option>
            </select>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100">
            <Filter className="h-3.5 w-3.5" />
            Advanced Filters
          </button>
        </div>

        <button
          onClick={onAddUser}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add User
          <span className="ml-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tracking-widest text-white">
            {totalUsers}
          </span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Class/Group</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600">{user.group}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider',
                        STATUS_STYLES[user.status],
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEditUser(user.id)}
                      className="p-2 text-slate-400 transition-colors hover:text-primary"
                      title="Edit user"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                  No pending users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Showing {users.length} of {totalUsers} pending users
        </p>
        <div className="flex gap-2">
          <button
            onClick={onPreviousPage}
            disabled={currentPage <= 1}
            className={cn(
              'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
              currentPage <= 1 ? 'cursor-not-allowed text-slate-300' : 'text-slate-400 hover:text-slate-900',
            )}
          >
            Previous
          </button>
          <button
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            className={cn(
              'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
              currentPage >= totalPages ? 'cursor-not-allowed text-slate-300' : 'text-slate-900 hover:bg-slate-50',
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
