import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import TeacherMobileNav from '../../components/common/TeacherMobileNav';
import { useTeacherProfile } from '../../components/teacher/profile/useTeacherProfile';
import SuccessToast from '../../components/teacher/profile/SuccessToast';
import ProfileTopBar from '../../components/teacher/profile/ProfileTopBar';
import ProfileHeader from '../../components/teacher/profile/ProfileHeader';
import PersonalInfoSection from '../../components/teacher/profile/PersonalInfoSection';
import AccountSecuritySection from '../../components/teacher/profile/AccountSecuritySection';

export default function TeacherProfilePage() {
  const {
    showSuccess,
    successMessage,
    errorMessage,
    isSaving,
    profileForm,
    setProfileForm,
    photoTimestamp,
    photoInputRef,
    handleSave,
    handlePhotoPick,
    handleDiscardChanges,
  } = useTeacherProfile();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TeacherMobileNav />
        <SuccessToast show={showSuccess} message={successMessage} />
        <ProfileTopBar isSaving={isSaving} onSave={handleSave} />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <ProfileHeader />

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <PersonalInfoSection
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              photoTimestamp={photoTimestamp}
              photoInputRef={photoInputRef}
              onPhotoPick={handlePhotoPick}
            />

            <AccountSecuritySection
              profileForm={profileForm}
              setProfileForm={setProfileForm}
            />

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button onClick={handleDiscardChanges} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Discard Changes
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
