import React, { useState } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

const roleLabel = {
  student: "Student",
  education_officer: "Education Officer",
  admin: "Admin",
};

function Login({ onLogin = () => {}, onSwitchToRegister = () => {}, registeredRole = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = onLogin(email.trim(), password);
    setError(message || "");
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-[0_24px_60px_-30px_rgba(180,83,9,0.45)]">
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-5 text-white sm:px-8">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold">
          <LogIn size={14} />
          Login
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="mt-1 text-sm text-orange-50">Sign in to continue your evaluation journey.</p>
      </div>

      <div className="p-6 sm:p-8">
        {registeredRole ? (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            Registered role: {roleLabel[registeredRole]}
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Email</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Password</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-12 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          No account?{" "}
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-amber-700 hover:text-amber-800 hover:underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
