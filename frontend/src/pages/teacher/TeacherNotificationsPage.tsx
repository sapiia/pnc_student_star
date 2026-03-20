import TeacherSidebar from '../../components/layout/sidebar/teacher/TeacherSidebar';
import NotificationTopBar from '../../components/teacher/notification/NotificationTopBar';
import NotificationHeader from '../../components/teacher/notification/NotificationHeader';
import NotificationFilters from '../../components/teacher/notification/NotificationFilters';
import NotificationList from '../../components/teacher/notification/NotificationList';
import { useNotificationsPage } from '../../components/teacher/notification/useNotificationsPage';

export default function TeacherNotificationsPage() {
  const {
    notifications,
    allCount,
    unreadCount,
    filter,
    setFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refresh,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearRead,
  } = useNotificationsPage();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <TeacherSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <NotificationTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => void refresh()}
          hasUnread={unreadCount > 0}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[800px] mx-auto">
            <NotificationHeader
              onMarkAllRead={markAllAsRead}
              onClearRead={clearRead}
            />

            <NotificationFilters
              filter={filter}
              setFilter={setFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              allCount={allCount}
              unreadCount={unreadCount}
            />

            <NotificationList
              isLoading={isLoading}
              error={error}
              notifications={notifications}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
