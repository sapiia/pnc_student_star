import { Download, Loader2 } from "lucide-react";

import { cn } from "../../../lib/utils";

import type { AdminReportsTab } from "./adminReports.types";
import { REPORT_TABS } from "./adminReports.utils";

const TAB_LABELS: Record<AdminReportsTab, string> = {
  overview: "overview",
  students: "students",
  teachers: "teachers",
};

interface AdminReportsHeaderProps {
  activeTab: AdminReportsTab;
  exporting: boolean;
  onExport: () => void;
  onTabChange: (tab: AdminReportsTab) => void;
}

export default function AdminReportsHeader({
  activeTab,
  exporting,
  onExport,
  onTabChange,
}: AdminReportsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 h-auto flex-col items-start justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:px-8 md:py-0">
      <div className="flex w-full flex-col items-start gap-3 md:w-auto md:flex-row md:items-center md:gap-8">
        <div>
          <h1 className="text-lg font-black text-slate-900 md:text-xl">
            Visual Reports
          </h1>
          <p className="hidden text-xs font-bold text-slate-500 md:block">
            Comprehensive performance analytics.
          </p>
        </div>

        <nav className="flex w-full overflow-x-auto rounded-xl bg-slate-100 p-1 md:w-auto">
          {REPORT_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "whitespace-nowrap rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Exporting..." : "Export Excel"}
        </button>
      </div>
    </header>
  );
}
