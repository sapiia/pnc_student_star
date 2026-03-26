import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import AdminOverviewReportsTab from "../../components/admin/reports/AdminOverviewReportsTab";
import AdminReportsHeader from "../../components/admin/reports/AdminReportsHeader";
import AdminStudentReportsTab from "../../components/admin/reports/AdminStudentReportsTab";
import AdminTeacherReportsTab from "../../components/admin/reports/AdminTeacherReportsTab";
import { REPORT_TAB_CONTENT_IDS } from "../../components/admin/reports/adminReports.utils";
import AdminMobileNav from "../../components/common/AdminMobileNav";
import AdminSidebar from "../../components/layout/sidebar/admin/AdminSidebar";
import { cn } from "../../lib/utils";

import { useAdminReportsPage } from "../../components/admin/reports/useAdminReportsPage";

export default function AdminReportsPage() {
  const {
    activeTab,
    error,
    exportNotice,
    exporting,
    handleExport,
    loading,
    overview,
    setActiveTab,
    setExportNotice,
    students,
    teachers,
  } = useAdminReportsPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <AdminMobileNav />
        <AdminReportsHeader
          activeTab={activeTab}
          exporting={exporting}
          onExport={handleExport}
          onTabChange={setActiveTab}
        />

        <div className="mx-auto max-w-7xl space-y-6 p-4 pb-24 md:space-y-8 md:p-8 md:pb-8">
          {loading && (
            <div className="flex h-40 items-center justify-center text-sm font-semibold text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading report data...
            </div>
          )}

          {exportNotice && (
            <div
              className={cn(
                "flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
                exportNotice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
              )}
            >
              <span>{exportNotice.message}</span>
              <button
                type="button"
                onClick={() => setExportNotice(null)}
                className="text-xs font-bold uppercase tracking-widest opacity-70 transition-opacity hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={REPORT_TAB_CONTENT_IDS[activeTab]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {activeTab === "students" ? (
                <AdminStudentReportsTab {...students} />
              ) : activeTab === "teachers" ? (
                <AdminTeacherReportsTab {...teachers} />
              ) : (
                <AdminOverviewReportsTab {...overview} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
