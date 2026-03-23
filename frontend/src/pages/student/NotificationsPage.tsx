import Sidebar from '../../components/layout/sidebar/student/Sidebar';
import StudentMobileNav from '../../components/common/StudentMobileNav';
import NotificationDetailModal from '../../components/student/notifications/NotificationDetailModal';
import NotificationsFilters from '../../components/student/notifications/NotificationsFilters';
import NotificationsHeader from '../../components/student/notifications/NotificationsHeader';
import NotificationsList from '../../components/student/notifications/NotificationsList';
import NotificationsTopBar from '../../components/student/notifications/NotificationsTopBar';
import { useStudentNotificationsPage } from '../../components/student/notifications/useStudentNotificationsPage';

export default function NotificationsPage() {
  const {
    activeNotificationId,
    deleteNotification,
    error,
    filter,
    filteredNotifications,
    isLoading,
    isMarkingAllRead,
    markAllRead,
    markAsRead,
    refresh,
    searchQuery,
    selectedNotification,
    setFilter,
    setSearchQuery,
    setSelectedNotification,
    setTypeFilter,
    typeFilter,
    unreadCount,
  } = useStudentNotificationsPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <StudentMobileNav />

        <NotificationsTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => void refresh()}
          onMarkAllRead={() => void markAllRead()}
          isMarkingAllRead={isMarkingAllRead}
          unreadCount={unreadCount}
        />

        <div className="mx-auto max-w-[800px] space-y-6 p-4 md:p-8">
          <NotificationsHeader />

          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          <NotificationsFilters
            filter={filter}
            unreadCount={unreadCount}
            typeFilter={typeFilter}
            onFilterChange={setFilter}
            onTypeFilterChange={setTypeFilter}
          />

          <NotificationsList
            notifications={filteredNotifications}
            isLoading={isLoading}
            activeNotificationId={activeNotificationId}
            onOpen={(notificationId) => {
              const selected = filteredNotifications.find(
                (notification) => notification.id === notificationId
              );

              if (selected) {
                setSelectedNotification(selected.raw);
              }
            }}
            onMarkRead={(notificationId) => void markAsRead(notificationId)}
            onDelete={(notificationId) => void deleteNotification(notificationId)}
          />
        </div>
      </main>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
