const fs = require('fs');

const file = 'c:/Users/SOPHY.MOEURN/Desktop/pnc_student_star/frontend/src/pages/AdminUserManagementPage.tsx';
let data = fs.readFileSync(file, 'utf8');

// 1. imports
if (!data.includes("import RadarChart")) {
  data = data.replace(
      "import { cn } from '../lib/utils';",
      "import { cn } from '../lib/utils';\nimport RadarChart from '../components/RadarChart';"
  );
}

// 2. States
if (!data.includes("isProfileModalOpen")) {
  data = data.replace(
    "const [isActionSubmitting, setIsActionSubmitting] = useState(false);",
    "const [isActionSubmitting, setIsActionSubmitting] = useState(false);\n  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);\n  const [selectedProfileUser, setSelectedProfileUser] = useState<UserRecord | null>(null);\n  const [profileEvaluations, setProfileEvaluations] = useState<any[]>([]);\n  const [isProfileSaving, setIsProfileSaving] = useState(false);\n  const [editStudentId, setEditStudentId] = useState('');\n  const [editClassName, setEditClassName] = useState('');"
  );
}

// 3. handleViewUser definition
if (!data.includes("handleViewUser")) {
  data = data.replace(
    "  const toggleUserActive = (user: UserRecord) => {",
    `
  const handleViewUser = async (user: UserRecord) => {
    setSelectedProfileUser(user);
    setEditStudentId(user.studentId || '');
    setEditClassName(user.className || '');
    setIsProfileModalOpen(true);
    if (user.role === 'Student') {
      try {
        const res = await fetch(\`\${API_BASE_URL}/evaluations/user/\${user.id}\`);
        if (res.ok) {
           const json = await res.json();
           setProfileEvaluations(Array.isArray(json) ? json : []);
        } else {
           setProfileEvaluations([]);
        }
      } catch {
        setProfileEvaluations([]);
      }
    }
  };

  const handleUpdateStudentInfo = async () => {
    if (!selectedProfileUser || isProfileSaving) return;
    setIsProfileSaving(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/users/\${selectedProfileUser.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedProfileUser.name,
          email: selectedProfileUser.email,
          role: selectedProfileUser.role.toLowerCase(),
          class_name: editClassName,
          student_id: editStudentId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === selectedProfileUser.id ? { ...u, studentId: editStudentId, group: editClassName, className: editClassName } : u));
        setSuccessMessage('Student info updated.');
        setToastType('success');
        setShowSuccess(true);
        setIsProfileModalOpen(false);
      } else {
        setFormError(data.error || 'Failed to update student info');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const toggleUserActive = (user: UserRecord) => {`
  );
}

// 4. Update tr
data = data.replace(
  `                      className="hover:bg-slate-50/50 transition-colors duration-300 group"`,
  `                      className={cn(
                        "hover:bg-slate-50/50 transition-colors duration-300 group cursor-pointer relative",
                        user.status === 'Inactive' ? 'grayscale opacity-60 bg-slate-50' : ''
                      )}
                      onClick={(e) => {
                        handleViewUser(user);
                      }}`
);

data = data.replace(
  `<button
                            onClick={() => toggleUserActive(user)}`,
  `<button
                            onClick={(e) => { e.stopPropagation(); toggleUserActive(user); }}`
);

data = data.replace(
  `<button 
                            onClick={() => deleteUser(user.id)}`,
  `<button 
                            onClick={(e) => { e.stopPropagation(); deleteUser(user.id); }}`
);

data = data.replace(
  `onClick={() => {
                              const u = users.find(u => u.id === user.id);
                              if (u) setConfirmAction({ kind: 'hard-delete', user: u });
                            }}`,
  `onClick={(e) => {
                              e.stopPropagation();
                              const u = users.find(u => u.id === user.id);
                              if (u) setConfirmAction({ kind: 'hard-delete', user: u });
                            }}`
);

// 5. Build Modal
const modalCode = `
      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedProfileUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsProfileModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-black text-slate-900 px-2 tracking-tight">User Profile</h3>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                 <div className="flex items-start gap-6 mb-8">
                   {selectedProfileUser.profileImage ? (
                     <img src={selectedProfileUser.profileImage} alt={selectedProfileUser.name} className="size-24 rounded-2xl object-cover" />
                   ) : (
                     <div className={cn("size-24 rounded-2xl flex items-center justify-center text-3xl font-black shrink-0", selectedProfileUser.color)}>
                       {selectedProfileUser.initials}
                     </div>
                   )}
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedProfileUser.name}</h2>
                     <p className="text-sm font-bold text-slate-500 mb-4">{selectedProfileUser.email}</p>
                     <div className="flex gap-2">
                       <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest">{selectedProfileUser.role}</span>
                       <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest shrink-0">{selectedProfileUser.status}</span>
                     </div>
                   </div>
                 </div>

                 {selectedProfileUser.role === 'Student' && (
                   <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-4">
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Edit Details</h4>
                         <div className="space-y-4">
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Student ID</label>
                             <input type="text" value={editStudentId} onChange={e => setEditStudentId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all" />
                           </div>
                           <div>
                             <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Class</label>
                             <input type="text" value={editClassName} onChange={e => setEditClassName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl text-sm transition-all" />
                           </div>
                           <button onClick={handleUpdateStudentInfo} disabled={isProfileSaving} className="w-full py-3 mt-2 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60">
                             {isProfileSaving ? 'Saving...' : 'Save Changes'}
                           </button>
                         </div>
                      </div>
                      
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Performance Overview</h4>
                         {profileEvaluations.length > 0 ? (
                           <div className="bg-slate-50 rounded-3xl p-6 h-[320px] border border-slate-100 shadow-inner flex items-center justify-center relative overflow-hidden">
                              <RadarChart 
                                data={profileEvaluations[0]?.responses?.map((r: any) => ({ subject: r.criterion_name || r.criterion_key, score: Number(r.star_value) * 20 })) || []}
                                lines={[ { key: 'score', name: 'Performance', color: '#5d5fef', fill: '#5d5fef' } ]}
                              />
                           </div>
                         ) : (
                           <div className="h-[320px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                             <div className="text-center w-full px-6">
                               <div className="size-16 rounded-full bg-slate-200/50 mx-auto mb-4 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                               </div>
                               <h3 className="font-black text-slate-800 text-lg mb-2">No Performance Data</h3>
                               <p className="text-sm text-slate-500 font-medium">This student hasn't received any evaluations yet.</p>
                             </div>
                           </div>
                         )}
                      </div>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

if (!data.includes("{/* Profile Modal */}")) {
  data = data.replace(
    "{/* Toast Notification */}",
    modalCode + "\n\n      {/* Toast Notification */}"
  );
}

fs.writeFileSync(file, data);
console.log('Update complete.');
