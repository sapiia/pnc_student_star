
import { LayoutDashboard, FileText, MessageSquare, Bell, Settings, User, HelpCircle, Info } from 'lucide-react';
import { useSidebarData } from '../../../../hooks/useSidebarData';
import BaseSidebar from '../BaseSidebar';
import { DEFAULT_AVATAR } from '../../../../lib/api';

interface SidebarProps { className?: string; }

export default function Sidebar({ className }: SidebarProps) {
  const { profileName, studentId, unreadNotificationCount, unreadMessageCount, profilePhoto } = useSidebarData();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Evaluations', path: '/history' },
    { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    { icon: Bell, label: 'Notifications', path: '/notifications', hasNotification: unreadNotificationCount > 0 },
    { icon: MessageSquare, label: 'Messager', path: '/messages', hasNotification: unreadMessageCount > 0, badgeCount: unreadMessageCount },
  ];

  const settingsItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: HelpCircle, label: 'Help Center', path: '/help' },
    { icon: Info, label: 'FAQ', path: '/faq' },
  ];

  return (
    <BaseSidebar
      className={className}
      menuItems={menuItems}
      profileName={profileName}
      profilePhoto={profilePhoto}
      profileRole={studentId ? `Student ID: ${studentId}` : 'Student'}
      defaultPhoto={DEFAULT_AVATAR}
      isSettingsEnabled={true}
      settingsItems={settingsItems}
      settingsPath="/profile"
    />
  );
}

