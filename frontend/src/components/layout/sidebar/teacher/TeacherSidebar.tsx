import { LayoutDashboard, Users, BarChart3, Settings, Bell, MessageSquare, User, HelpCircle, Info } from 'lucide-react';
import BaseSidebar from '../BaseSidebar';
import { useProfileData } from '../../../../hooks/useProfileData';
import { DEFAULT_AVATAR } from '../../../../lib/api';

interface TeacherSidebarProps {
  className?: string;
}

export default function TeacherSidebar({ className }: TeacherSidebarProps) {
  const { profileName, profilePhoto } = useProfileData({ defaultName: 'Teacher', defaultPhoto: DEFAULT_AVATAR });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: Users, label: 'Student List', path: '/teacher/students' },
    { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
    { icon: MessageSquare, label: 'Messager', path: '/teacher/messages' },
    { icon: BarChart3, label: 'Reports', path: '/teacher/reports' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' },
  ];

  const settingsItems = [
    { icon: User, label: 'Profile', path: '/teacher/settings' },
    { icon: HelpCircle, label: 'Help Center', path: '/teacher/help' },
    { icon: Info, label: 'FAQ', path: '/teacher/faq' },
  ];

  return (
    <BaseSidebar
      className={className}
      menuItems={menuItems}
      profileName={profileName}
      profilePhoto={profilePhoto}
      profileRole="Lead Instructor"
      defaultPhoto={DEFAULT_AVATAR}
      isSettingsEnabled={false}
      settingsItems={settingsItems}
      settingsPath="/teacher/settings"
    />
  );
}
