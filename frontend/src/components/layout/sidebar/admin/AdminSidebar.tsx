import { LayoutDashboard, Users, Calendar, BarChart3, Settings, MessageSquare, User, HelpCircle, Info, Bell } from 'lucide-react';
import BaseSidebar from '../BaseSidebar';
import { useProfileData } from '../../../../hooks/useProfileData';
import { DEFAULT_AVATAR } from '../../../../lib/api';

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const { profileName, profilePhoto } = useProfileData({ defaultName: 'Administrator', defaultPhoto: DEFAULT_AVATAR });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: MessageSquare, label: 'Messager', path: '/admin/messages', hasNotification: true },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ];

  const settingsItems = [
    { icon: User, label: 'Profile', path: '/admin/settings' },
    { icon: HelpCircle, label: 'Help Center', path: '/admin/help' },
    { icon: Info, label: 'FAQ', path: '/admin/faq' },
  ];

  return (
    <BaseSidebar
      className={className}
      menuItems={menuItems}
      profileName={profileName}
      profilePhoto={profilePhoto}
      profileRole="System Admin"
      defaultPhoto={DEFAULT_AVATAR}
      isSettingsEnabled={false}
      settingsItems={settingsItems}
      settingsPath="/admin/settings"
    />
  );
}
