import { ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Contact } from '../../../lib/teacher/types';

type ChatHeaderProps = {
  selectedContact: Contact | null;
  onBack: () => void;
  onOpenStudentProfile: (studentId: number) => void;
};

export default function ChatHeader({ selectedContact, onBack, onOpenStudentProfile }: ChatHeaderProps) {
  return (
    <div className="p-4 md:p-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <button
          onClick={onBack}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={selectedContact?.type !== 'Student'}
          onClick={() => {
            if (selectedContact?.type === 'Student') onOpenStudentProfile(selectedContact.id);
          }}
          className={cn(
            "flex items-center gap-3 md:gap-4 text-left",
            selectedContact?.type === 'Student'
              ? "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-2xl"
              : "cursor-default"
          )}
          aria-label={selectedContact?.type === 'Student' ? `View ${selectedContact?.name} profile` : undefined}
        >
          <div className="size-10 md:size-12 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-200">
            <img src={selectedContact?.avatar} alt={selectedContact?.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-lg font-black text-slate-900 truncate">{selectedContact?.name}</h3>
            <p className="text-[10px] md:text-xs font-bold text-slate-500">{selectedContact?.role}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
