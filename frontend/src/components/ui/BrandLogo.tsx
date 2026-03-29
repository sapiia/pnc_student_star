import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

// Import the logo image
import pnLogo from '../../assets/images/PN - Round Logo.png';

interface LogoMarkProps {
  className?: string;
}

export const PNLogoMark: React.FC<LogoMarkProps> = ({ className }) => {
  return (
    <div className={cn("relative", className)}>
      <img 
        src={pnLogo} 
        alt="PNC Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

interface BrandLogoProps {
  title: string;
  subtitle: string;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ title, subtitle, className }) => {
  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <PNLogoMark className="size-10 shrink-0" />
      <div className="flex flex-col min-w-0">
        <motion.span 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-black text-primary leading-tight truncate"
        >
          {title}
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate"
        >
          {subtitle}
        </motion.span>
      </div>
    </div>
  );
};

export default BrandLogo;

