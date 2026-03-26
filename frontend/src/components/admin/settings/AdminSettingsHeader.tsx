import { cn } from "../../../lib/utils";

import type { SettingsTab } from "./adminSettings.types";

interface AdminSettingsHeaderProps {
  activeTab: SettingsTab;
  isSaving: boolean;
  onSave: () => void;
  onTabChange: (tab: SettingsTab) => void;
}

export default function AdminSettingsHeader({
  activeTab,
  isSaving,
  onSave,
  onTabChange,
}: AdminSettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-auto min-h-16 flex-col items-start justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md md:flex-row md:items-center md:px-8 md:py-0">
      <div className="flex w-full items-center gap-3 md:w-auto md:gap-4">
        <h1 className="text-lg font-black text-slate-900 md:text-xl">Settings</h1>
        <div className="hidden h-4 w-px bg-slate-200 md:block" />
        <div className="flex gap-1">
          {(["system", "profile"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center gap-4 md:w-auto">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full rounded-xl bg-primary px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
        >
          {isSaving ? "Saving..." : "Save All Changes"}
        </button>
      </div>
    </header>
  );
}
