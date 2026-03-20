import { MessageSquare } from 'lucide-react';

export default function EmptyChatState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="size-20 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-slate-900">Select a contact</h3>
      <p className="text-slate-500 font-bold max-w-xs mx-auto mt-2">
        Choose a contact to view and send messages.
      </p>
    </div>
  );
}