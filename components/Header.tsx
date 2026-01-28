
import React from 'react';
import type { NavigationTab } from '../types';
import { NavigationTab as NavTabs } from '../types';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentMode: 'VOCAB' | 'SENTENCE';
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  // Fix: Replaced `JSX.Element` with `React.ReactNode` to fix 'Cannot find namespace JSX' error.
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary ${
        isActive
          ? 'bg-brand-primary text-white shadow-lg'
          : 'bg-dark-card text-medium-text hover:bg-dark-border hover:text-light-text'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentMode }) => {
  return (
    <nav className="p-2 bg-dark-card rounded-lg shadow-md animate-fade-in mt-6">
      <div className="grid grid-cols-3 gap-2">
        <NavButton
          label={currentMode === 'VOCAB' ? 'Add Word' : 'Add Sentence'}
          isActive={activeTab === NavTabs.ADD}
          onClick={() => setActiveTab(NavTabs.ADD)}
          icon={<PlusIcon />}
        />
        <NavButton
          label="Review List"
          isActive={activeTab === NavTabs.REVIEW}
          onClick={() => setActiveTab(NavTabs.REVIEW)}
          icon={<ListIcon />}
        />
        <NavButton
          label="Practice"
          isActive={activeTab === NavTabs.PRACTICE}
          onClick={() => setActiveTab(NavTabs.PRACTICE)}
          icon={<BrainIcon />}
        />
      </div>
    </nav>
  );
};

// SVG Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);
