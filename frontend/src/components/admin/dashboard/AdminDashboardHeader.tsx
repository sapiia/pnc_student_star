import { Bell, Search } from 'lucide-react';

export default function AdminDashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-auto min-h-16 flex-col items-start justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:px-6 md:py-0 lg:px-8">
      <div>
        <h1 className="text-lg font-black text-slate-900 md:text-xl">Admin Dashboard</h1>
        <p className="hidden text-xs font-bold text-slate-500 md:block">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="flex w-full items-center gap-3 md:w-auto md:gap-6">
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-xl border-transparent bg-slate-100 py-2 pr-4 pl-10 text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 md:w-48 lg:w-80"
          />
        </div>

        <button className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
