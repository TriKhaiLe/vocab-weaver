import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  // Fix: Replaced `JSX.Element` with `React.ReactNode` to fix 'Cannot find namespace JSX' error.
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-light-text"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {icon}
          {title}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-dark-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};