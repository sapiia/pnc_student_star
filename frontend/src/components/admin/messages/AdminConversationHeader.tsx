import { ChevronLeft } from 'lucide-react';

import type { Contact } from './adminMessages.types';

interface AdminConversationHeaderProps {
  contact: Contact;
  onBack: () => void;
}

export default function AdminConversationHeader({
  contact,
  onBack,
}: AdminConversationHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4 md:p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="-ml-2 rounded-lg p-2 text-slate-400 transition-colors hover:text-slate-600 md:hidden"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="size-12 shrink-0 overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
          <img src={contact.avatar} alt={contact.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{contact.name}</h3>
          <p className="text-xs font-bold text-slate-500">{contact.role}</p>
        </div>
      </div>
    </div>
  );
}
