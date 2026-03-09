import { LayoutDashboard, Users, Calendar, BarChart3, Settings, MessageSquare, User, HelpCircle, Info } from 'lucide-react';
import BaseSidebar from './BaseSidebar';
import { useProfileData } from '../../../hooks/useProfileData';

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const { profileName, profilePhoto } = useProfileData({ defaultName: 'Administrator', defaultPhoto: 'http://localhost:3001/uploads/logo/star_gmail_logo.jpg' });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages', hasNotification: true },
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
      defaultPhoto="https://picsum.photos/seed/admin/100/100"
      isSettingsEnabled={false}
      settingsItems={settingsItems}
      settingsPath="/admin/settings"
    />
  );
}
