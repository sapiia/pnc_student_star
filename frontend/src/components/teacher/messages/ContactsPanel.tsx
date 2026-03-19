import { Maximize2, Minimize2, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Contact } from '../../../lib/teacher/types';
import { formatDateTime } from '../../../lib/teacher/utils';

const CONTACT_ROLE_OPTIONS = ['All', 'Admin', 'Teacher', 'Student'] as const;

type ContactsPanelProps = {
  isMobileChatOpen: boolean;
  isCompactMode: boolean;
  isLoading: boolean;
  filteredContacts: Contact[];
  unreadTotal: number;
  searchQuery: string;
  roleFilter: 'All' | 'Admin' | 'Teacher' | 'Student';
  showUnreadOnly: boolean;
  selectedContactId: number | null;
  onToggleCompactMode: () => void;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: 'All' | 'Admin' | 'Teacher' | 'Student') => void;
  onToggleUnreadOnly: () => void;
  onSelectContact: (contactId: number) => void;
};

export default function ContactsPanel({
  isMobileChatOpen,
  isCompactMode,
  isLoading,
  filteredContacts,
  unreadTotal,
  searchQuery,
  roleFilter,
  showUnreadOnly,
  selectedContactId,
  onToggleCompactMode,
  onSearchChange,
  onRoleFilterChange,
  onToggleUnreadOnly,
  onSelectContact,
}: ContactsPanelProps) {
  return (
    <div
      className={cn(
        'w-full md:w-[300px] lg:w-[350px] border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 pb-20 md:pb-0',
        isMobileChatOpen ? '-translate-x-full absolute md:relative w-full h-full' : 'translate-x-0 relative',
      )}
    >
      <div className="p-6 space-y-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inbox Overview</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-900">{filteredContacts.length} contacts</span>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadTotal} unread</span>
            </div>
          </div>
          <button
            onClick={onToggleCompactMode}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-primary transition-colors font-semibold"
          >
            {isCompactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            {isCompactMode ? 'Expand' : 'Compact'}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CONTACT_ROLE_OPTIONS.map((role) => {
            const active = roleFilter === role;
            return (
              <button
                key={role}
                onClick={() => onRoleFilterChange(role)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
                  active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/30',
                )}
              >
                {role}
              </button>
            );
          })}
          <button
            onClick={onToggleUnreadOnly}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-2',
              showUnreadOnly ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200',
            )}
          >
            <span className="size-2 rounded-full bg-amber-400" />
            Unread only
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="px-6 py-8 text-sm font-medium text-slate-500">Loading contacts...</div>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={cn(
                'w-full text-left border-b border-slate-50 transition-all relative group',
                isCompactMode ? 'p-3' : 'p-6',
                selectedContactId === contact.id ? 'bg-primary/5' : 'hover:bg-slate-50',
              )}
            >
              {selectedContactId === contact.id ? (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              ) : null}
              <div className={cn('flex', isCompactMode ? 'gap-3' : 'gap-4')}>
                <div className={cn('rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-200', isCompactMode ? 'size-10' : 'size-12')}>
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={cn('font-black text-slate-900 truncate', isCompactMode ? 'text-xs' : 'text-sm')}>{contact.name}</h4>
                    <span className={cn('font-bold text-slate-400 whitespace-nowrap ml-2', isCompactMode ? 'text-[9px]' : 'text-[10px]')}>{formatDateTime(contact.timestamp)}</span>
                  </div>
                  <p className={cn('text-slate-500 truncate font-medium', isCompactMode ? 'text-[10px]' : 'text-xs')}>{contact.lastMessage || 'No messages yet'}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{contact.role}</p>
                    <div className="flex items-center gap-2">
                      {contact.unreadCount > 0 ? (
                        <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{contact.unreadCount}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-6 py-8 text-sm font-medium text-slate-500">No contacts found.</div>
        )}
      </div>
    </div>
  );
}
