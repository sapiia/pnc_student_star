import React, { useMemo, useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";

const initialUsers = [
  { name: "Serey Roth", email: "serey.roth@pnc.edu.kh", role: "education_officer", generation: "", className: "" },
  { name: "Reaksmey SAN", email: "reaksmey.san@student.pnc.edu.kh", role: "student", generation: "Generation 12", className: "Class A" },
  { name: "System Admin", email: "admin@pnc.edu.kh", role: "admin", generation: "", className: "" },
];

const roleLabel = {
  student: "Student",
  education_officer: "Education Officer",
  admin: "Admin",
};

function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [generation, setGeneration] = useState("");
  const [className, setClassName] = useState("");
  const [editingEmail, setEditingEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const isStudentRole = role === "student";

  const handleAdd = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }

    setUsers((prev) => [
      ...prev,
      {
        name: name.trim(),
        email: email.trim(),
        role,
        generation: isStudentRole ? generation.trim() : "",
        className: isStudentRole ? className.trim() : "",
      },
    ]);
    setName("");
    setEmail("");
    setRole("student");
    setGeneration("");
    setClassName("");
  };

  const handleEdit = (user) => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setGeneration(user.generation || "");
    setClassName(user.className || "");
    setEditingEmail(user.email);
  };

  const handleDelete = (emailToDelete) => {
    setUsers((prev) => prev.filter((user) => user.email !== emailToDelete));
    if (editingEmail === emailToDelete) {
      setName("");
      setEmail("");
      setRole("student");
      setGeneration("");
      setClassName("");
      setEditingEmail(null);
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!editingEmail || !name.trim() || !email.trim()) {
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.email === editingEmail
          ? {
              ...user,
              name: name.trim(),
              email: email.trim(),
              role,
              generation: isStudentRole ? generation.trim() : "",
              className: isStudentRole ? className.trim() : "",
            }
          : user
      )
    );
    setName("");
    setEmail("");
    setRole("student");
    setGeneration("");
    setClassName("");
    setEditingEmail(null);
  };

  const handleCancelEdit = () => {
    setName("");
    setEmail("");
    setRole("student");
    setGeneration("");
    setClassName("");
    setEditingEmail(null);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (value !== "student") {
      setGeneration("");
      setClassName("");
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortOrder("asc");
  };

  const visibleUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const filteredUsers = users.filter((user) => {
      const roleText = roleLabel[user.role] || "";
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        roleText.toLowerCase().includes(keyword) ||
        (user.generation || "").toLowerCase().includes(keyword) ||
        (user.className || "").toLowerCase().includes(keyword)
      );
    });

    return filteredUsers.sort((a, b) => {
      const left = (sortBy === "role" ? roleLabel[a.role] : a[sortBy]) || "";
      const right = (sortBy === "role" ? roleLabel[b.role] : b[sortBy]) || "";
      const result = String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? result : -result;
    });
  }, [users, searchTerm, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-sm text-slate-500">Create and manage users for the evaluation platform.</p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <UserPlus size={18} />
            {editingEmail ? "Edit User" : "Add User"}
          </h2>
          <form onSubmit={editingEmail ? handleUpdate : handleAdd} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={role}
              onChange={(event) => handleRoleChange(event.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="student">Student</option>
              <option value="education_officer">Education Officer</option>
              <option value="admin">Admin</option>
            </select>
            <input
              type="text"
              placeholder={isStudentRole ? "Generation" : "Not available for admin/teacher"}
              value={generation}
              onChange={(event) => setGeneration(event.target.value)}
              disabled={!isStudentRole}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <input
              type="text"
              placeholder={isStudentRole ? "Class" : "Not available for admin/teacher"}
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              disabled={!isStudentRole}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {editingEmail ? "Update User" : "Add User"}
            </button>
            {editingEmail && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShieldCheck size={18} />
            User List
          </h2>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                type="text"
                placeholder="Search by name, email, role, generation, class"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="md:col-span-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="role">Sort by Role</option>
                  <option value="generation">Sort by Generation</option>
                  <option value="className">Sort by Class</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                  className="whitespace-nowrap rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Sort {sortOrder === "asc" ? "^" : "v"}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-3">
                    <button type="button" onClick={() => handleSort("name")} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Name {sortBy === "name" ? (sortOrder === "asc" ? "^" : "v") : ""}
                    </button>
                  </th>
                  <th className="pb-3">
                    <button type="button" onClick={() => handleSort("email")} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email {sortBy === "email" ? (sortOrder === "asc" ? "^" : "v") : ""}
                    </button>
                  </th>
                  <th className="pb-3">
                    <button type="button" onClick={() => handleSort("role")} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Role {sortBy === "role" ? (sortOrder === "asc" ? "^" : "v") : ""}
                    </button>
                  </th>
                  <th className="pb-3">
                    <button type="button" onClick={() => handleSort("generation")} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Generation {sortBy === "generation" ? (sortOrder === "asc" ? "^" : "v") : ""}
                    </button>
                  </th>
                  <th className="pb-3">
                    <button type="button" onClick={() => handleSort("className")} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Class {sortBy === "className" ? (sortOrder === "asc" ? "^" : "v") : ""}
                    </button>
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user, index) => (
                  <tr key={`${user.email}-${index}`} className="border-b border-slate-50">
                    <td className="py-4 text-sm font-semibold text-slate-800">{user.name}</td>
                    <td className="py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-4 text-sm text-slate-700">{roleLabel[user.role]}</td>
                    <td className="py-4 text-sm text-slate-700">{user.generation || "-"}</td>
                    <td className="py-4 text-sm text-slate-700">{user.className || "-"}</td>
                    <td className="py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.email)}
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserManagement;
