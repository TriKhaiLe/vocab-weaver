import React, { useState } from 'react';

interface HelpTooltipProps {
  children: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="text-medium-text hover:text-light-text transition-colors duration-200"
        aria-label="Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
          style={{ animationDuration: '200ms' }}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-dark-card border border-dark-border rounded-lg shadow-xl p-8 m-4 max-w-lg w-full relative animate-slide-up max-h-[85vh] overflow-y-auto"
            style={{ animationDuration: '300ms' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-medium-text hover:text-light-text transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
};