import { useNavigate } from 'react-router-dom';

import AdminNotificationsFilters from '../../components/admin/notifications/AdminNotificationsFilters';
import AdminNotificationsHeader from '../../components/admin/notifications/AdminNotificationsHeader';
import AdminNotificationsList from '../../components/admin/notifications/AdminNotificationsList';
import AdminNotificationsToolbar from '../../components/admin/notifications/AdminNotificationsToolbar';
import AdminSidebar from '../../components/layout/sidebar/admin/AdminSidebar';

import type { AdminNotification } from '../../components/admin/notifications/adminNotifications.types';
import { useAdminNotificationsPage } from '../../components/admin/notifications/useAdminNotificationsPage';

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const {
    clearRead,
    deleteNotification,
    error,
    filter,
    filteredNotifications,
    isLoading,
    loadNotifications,
    markAllAsRead,
    markAsRead,
    notifications,
    searchQuery,
    setFilter,
    setSearchQuery,
    setTypeFilter,
    typeFilter,
    unreadCount,
  } = useAdminNotificationsPage();

  const handleOpenMessage = (notification: AdminNotification) => {
    navigate('/admin/messages', {
      state: {
        selectedContactId: notification.sender.id,
        selectedContactName: notification.sender.name,
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <AdminSidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <AdminNotificationsHeader
          hasUnread={unreadCount > 0}
          searchQuery={searchQuery}
          onRefresh={() => void loadNotifications()}
          onSearchChange={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[900px] space-y-6">
            <AdminNotificationsToolbar
              onClearRead={clearRead}
              onMarkAllAsRead={markAllAsRead}
            />

            <AdminNotificationsFilters
              filter={filter}
              totalCount={notifications.length}
              typeFilter={typeFilter}
              unreadCount={unreadCount}
              onFilterChange={setFilter}
              onTypeFilterChange={setTypeFilter}
            />

            <AdminNotificationsList
              error={error}
              isLoading={isLoading}
              notifications={filteredNotifications}
              onDelete={deleteNotification}
              onMarkAsRead={markAsRead}
              onOpenMessage={handleOpenMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
