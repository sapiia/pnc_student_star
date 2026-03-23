export default function AuthPageFooter() {
  return (
    <footer className="p-6 text-center">
      <p className="text-xs text-slate-400">
        &copy; 2024 PNC Student Star. All rights reserved.
        <br className="sm:hidden" />
        <a className="px-1 underline hover:text-primary" href="#">
          Privacy Policy
        </a>
        <span className="px-1" aria-hidden="true">
          |
        </span>
        <a className="px-1 underline hover:text-primary" href="#">
          Support
        </a>
      </p>
    </footer>
  );
}
