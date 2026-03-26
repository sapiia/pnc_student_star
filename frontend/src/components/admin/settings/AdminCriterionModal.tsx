import { Search, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "../../../lib/utils";

import type {
  CriterionFormState,
  CriterionIconOption,
} from "./adminSettings.types";
import { getCriterionIconStyle } from "./adminSettings.utils";

interface AdminCriterionModalProps {
  draft: CriterionFormState;
  editingCriterionId: string | null;
  filteredIconOptions: CriterionIconOption[];
  iconSearchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onIconSearchChange: (value: string) => void;
  onSave: () => void;
  onStarDescriptionChange: (index: number, value: string) => void;
  onUpdateDraft: <K extends keyof CriterionFormState>(
    key: K,
    value: CriterionFormState[K],
  ) => void;
  ratingScale: number;
  starDescriptions: string[];
}

export default function AdminCriterionModal({
  draft,
  editingCriterionId,
  filteredIconOptions,
  iconSearchQuery,
  isOpen,
  onClose,
  onIconSearchChange,
  onSave,
  onStarDescriptionChange,
  onUpdateDraft,
  ratingScale,
  starDescriptions,
}: AdminCriterionModalProps) {
  const previewIcon = getCriterionIconStyle(draft.name, draft.icon);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {editingCriterionId ? "Edit Criterion" : "Add New Criterion"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    Set the name, icon, summary, and {ratingScale} star
                    descriptions.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl",
                      previewIcon.className,
                    )}
                  >
                    {previewIcon.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Preview
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {draft.name || "New Criterion"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_1.2fr]">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Criterion Name
                    </label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(event) =>
                        onUpdateDraft("name", event.target.value)
                      }
                      placeholder="e.g., Communication Skills"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Description
                    </label>
                    <textarea
                      value={draft.description}
                      onChange={(event) =>
                        onUpdateDraft("description", event.target.value)
                      }
                      placeholder="Describe what students should reflect on..."
                      className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Star Guidance
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          Write one paragraph for each of the {ratingScale} stars.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-amber-500 shadow-sm">
                        {Array.from({ length: ratingScale }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-amber-500" />
                        ))}
                      </div>
                    </div>

                    <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                      {starDescriptions.map((description, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {index + 1} Star Description
                          </label>
                          <textarea
                            value={description}
                            onChange={(event) =>
                              onStarDescriptionChange(index, event.target.value)
                            }
                            placeholder={`Explain what ${index + 1} star means for ${draft.name || "this criterion"}...`}
                            className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Choose Icon
                  </label>
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={iconSearchQuery}
                        onChange={(event) =>
                          onIconSearchChange(event.target.value)
                        }
                        placeholder="Search icons..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1">
                      {filteredIconOptions.map((option) => {
                        const optionIcon = getCriterionIconStyle(
                          option.label,
                          option.value,
                        );
                        const isSelected = draft.icon === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => onUpdateDraft("icon", option.value)}
                            className={cn(
                              "rounded-xl border p-2 text-center transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <div
                              className={cn(
                                "mx-auto mb-1 flex size-9 items-center justify-center rounded-xl",
                                optionIcon.className,
                              )}
                            >
                              {optionIcon.icon}
                            </div>
                            <p className="text-[10px] font-bold leading-tight text-slate-700">
                              {option.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {filteredIconOptions.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                        No icons match that search.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50 p-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
              >
                {editingCriterionId ? "Save Criterion" : "Add Criterion"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
