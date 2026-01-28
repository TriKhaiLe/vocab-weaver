
import React from 'react';

interface ModeSwitcherProps {
  currentMode: 'VOCAB' | 'SENTENCE';
  setCurrentMode: (mode: 'VOCAB' | 'SENTENCE') => void;
}

const ModeButton: React.FC<{
    label: string;
    description: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, description, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex-1 text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                isActive
                    ? 'bg-brand-primary/20 border-brand-primary shadow-lg'
                    : 'bg-dark-card border-dark-border hover:border-dark-border-hover hover:bg-dark-card/80'
            }`}
        >
            <h3 className="font-bold text-lg text-light-text">{label}</h3>
            <p className="text-sm text-medium-text">{description}</p>
        </button>
    );
};

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, setCurrentMode }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <ModeButton
            label="Vocabulary Weaver"
            description="Learn single words in context."
            isActive={currentMode === 'VOCAB'}
            onClick={() => setCurrentMode('VOCAB')}
        />
        <ModeButton
            label="Sentence Shaper"
            description="Translate and practice full sentences."
            isActive={currentMode === 'SENTENCE'}
            onClick={() => setCurrentMode('SENTENCE')}
        />
    </div>
  );
};
