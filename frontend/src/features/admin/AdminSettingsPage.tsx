import AdminCriterionDeleteModal from "../../components/admin/settings/AdminCriterionDeleteModal";
import AdminCriterionModal from "../../components/admin/settings/AdminCriterionModal";
import AdminSettingsHeader from "../../components/admin/settings/AdminSettingsHeader";
import AdminSettingsProfileTab from "../../components/admin/settings/AdminSettingsProfileTab";
import AdminSettingsSystemTab from "../../components/admin/settings/AdminSettingsSystemTab";
import AdminSettingsToast from "../../components/admin/settings/AdminSettingsToast";
import { useAdminSettingsPage } from "../../components/admin/settings/useAdminSettingsPage";
import AdminMobileNav from "../../components/common/AdminMobileNav";
import AdminSidebar from "../../components/layout/sidebar/admin/AdminSidebar";

export default function AdminSettingsPage() {
  const {
    activeTab,
    closeCriterionModal,
    confirmDeleteCriterion,
    criteriaList,
    criterionPendingDelete,
    editingCriterionId,
    errorMessage,
    evaluationIntervalDays,
    filteredCriterionIconOptions,
    formattedIntervalMonths,
    handleDeleteCriterion,
    handlePhotoPick,
    handleSave,
    handleSaveCriterion,
    iconSearchQuery,
    isLoadingCriteria,
    isSaving,
    newCrit,
    newCritStarDescriptions,
    notificationRetentionDays,
    openAddCriterionModal,
    openEditCriterionModal,
    photoInputRef,
    photoTimestamp,
    profileForm,
    ratingScale,
    rolePermissions,
    setActiveTab,
    setCriterionPendingDelete,
    setEvaluationIntervalDays,
    setIconSearchQuery,
    setNotificationRetentionDays,
    setRatingScale,
    showAddModal,
    showSuccess,
    successMessage,
    toggleRolePermission,
    toggleStudentMultipleEvaluations,
    updateCriterionDraft,
    updateCriterionStarDescription,
    updateProfileField,
    updateRolePermission,
  } = useAdminSettingsPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />

      <main className="relative flex-1 overflow-y-auto">
        <AdminMobileNav />
        <AdminSettingsToast show={showSuccess} message={successMessage} />
        <AdminCriterionDeleteModal
          criterion={criterionPendingDelete}
          onClose={() => setCriterionPendingDelete(null)}
          onConfirm={confirmDeleteCriterion}
        />

        <AdminSettingsHeader
          activeTab={activeTab}
          isSaving={isSaving}
          onSave={handleSave}
          onTabChange={setActiveTab}
        />

        <div className="mx-auto max-w-7xl space-y-6 p-4 pb-24 md:space-y-8 md:p-8 md:pb-8">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {errorMessage}
            </div>
          )}

          {activeTab === "system" ? (
            <AdminSettingsSystemTab
              criteriaList={criteriaList}
              evaluationIntervalDays={evaluationIntervalDays}
              formattedIntervalMonths={formattedIntervalMonths}
              isLoadingCriteria={isLoadingCriteria}
              notificationRetentionDays={notificationRetentionDays}
              onDeleteCriterion={handleDeleteCriterion}
              onEvaluationIntervalDaysChange={setEvaluationIntervalDays}
              onNotificationRetentionDaysChange={setNotificationRetentionDays}
              onOpenAddCriterionModal={openAddCriterionModal}
              onOpenEditCriterionModal={openEditCriterionModal}
              onRatingScaleChange={setRatingScale}
              onRolePermissionChange={updateRolePermission}
              onToggleRolePermission={toggleRolePermission}
              onToggleStudentMultipleEvaluations={
                toggleStudentMultipleEvaluations
              }
              ratingScale={ratingScale}
              rolePermissions={rolePermissions}
            />
          ) : (
            <AdminSettingsProfileTab
              onPhotoPick={handlePhotoPick}
              onProfileFieldChange={updateProfileField}
              photoInputRef={photoInputRef}
              photoTimestamp={photoTimestamp}
              profileForm={profileForm}
            />
          )}
        </div>

        <AdminCriterionModal
          draft={newCrit}
          editingCriterionId={editingCriterionId}
          filteredIconOptions={filteredCriterionIconOptions}
          iconSearchQuery={iconSearchQuery}
          isOpen={showAddModal}
          onClose={closeCriterionModal}
          onIconSearchChange={setIconSearchQuery}
          onSave={handleSaveCriterion}
          onStarDescriptionChange={updateCriterionStarDescription}
          onUpdateDraft={updateCriterionDraft}
          ratingScale={ratingScale}
          starDescriptions={newCritStarDescriptions}
        />
      </main>
    </div>
  );
}
