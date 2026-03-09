import { LayoutDashboard, Users, BarChart3, Settings, Bell, MessageSquare, User, HelpCircle, Info } from 'lucide-react';
import BaseSidebar from './BaseSidebar';
import { useProfileData } from '../../../hooks/useProfileData';

interface TeacherSidebarProps {
  className?: string;
}

export default function TeacherSidebar({ className }: TeacherSidebarProps) {
  const { profileName, profilePhoto } = useProfileData({ defaultName: 'Teacher', defaultPhoto: 'https://picsum.photos/seed/sarah/100/100' });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: Users, label: 'Student List', path: '/teacher/students' },
    { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
    { icon: MessageSquare, label: 'Message Admin', path: '/teacher/messages' },
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
      defaultPhoto="https://picsum.photos/seed/sarah/100/100"
      isSettingsEnabled={true}
      settingsItems={settingsItems}
      settingsPath="/teacher/settings"
    />
  );
}
