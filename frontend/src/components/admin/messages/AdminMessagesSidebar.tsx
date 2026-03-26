import { Search } from 'lucide-react';

import type { Contact } from './adminMessages.types';
import { formatDateTime } from './adminMessages.utils';
import { cn } from '../../../lib/utils';

interface AdminMessagesSidebarProps {
  contacts: Contact[];
  isConversationOpen: boolean;
  isLoading: boolean;
  searchQuery: string;
  selectedContactId: number | null;
  onSearchChange: (value: string) => void;
  onSelectContact: (contactId: number) => void;
}

export default function AdminMessagesSidebar({
  contacts,
  isConversationOpen,
  isLoading,
  searchQuery,
  selectedContactId,
  onSearchChange,
  onSelectContact,
}: AdminMessagesSidebarProps) {
  return (
    <div
      className={cn(
        'flex w-full shrink-0 flex-col border-r border-slate-200 bg-white md:w-[350px]',
        isConversationOpen ? 'hidden md:flex' : 'flex',
      )}
    >
      <div className="p-6">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-6 py-8 text-sm font-medium text-slate-500">
            Loading contacts...
          </div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={cn(
                'group relative w-full border-b border-slate-50 p-6 text-left transition-all',
                selectedContactId === contact.id ? 'bg-primary/5' : 'hover:bg-slate-50',
              )}
            >
              {selectedContactId === contact.id ? (
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
              ) : null}
              <div className="flex gap-4">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-slate-200 shadow-sm">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between">
                    <h4 className="truncate text-sm font-black text-slate-900">
                      {contact.name}
                    </h4>
                    <span className="ml-2 whitespace-nowrap text-[10px] font-bold text-slate-400">
                      {formatDateTime(contact.timestamp)}
                    </span>
                  </div>
                  <p className="truncate text-xs font-medium text-slate-500">
                    {contact.lastMessage || 'No messages yet'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {contact.role}
                    </p>
                    {contact.unreadCount > 0 ? (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-black text-white">
                        {contact.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-6 py-8 text-sm font-medium text-slate-500">
            No contacts found.
          </div>
        )}
      </div>
    </div>
  );
}
