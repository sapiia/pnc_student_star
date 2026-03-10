import React from 'react';
import { cn } from '../../lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn("py-4 px-4 border-t border-slate-100 text-center", className)}>
      <p className="text-[10px] text-slate-400 font-medium">
        © {currentYear} PNC Student Star. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

