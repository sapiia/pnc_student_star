import React from "react";

function Footer({ compact = false }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`mt-6 border-t border-slate-200/80 bg-white/70 px-4 py-3 text-xs text-slate-600 backdrop-blur ${
        compact ? "rounded-xl" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="font-medium text-slate-700">PNC Student Star</p>
        <p>{year} Passerelles Numeriques Cambodia</p>
      </div>
    </footer>
  );
}

export default Footer;
