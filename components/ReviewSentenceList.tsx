
import React, { useState } from 'react';
import type { SentenceEntry } from '../types';

interface ReviewSentenceListProps {
  sentenceList: SentenceEntry[];
  deleteSentenceEntry: (id: string) => void;
}

const ProficiencyStars: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => (
                <span key={index} className={index < score ? 'text-yellow-400' : 'text-gray-600'}>
                    ★
                </span>
            ))}
        </div>
    );
};

const SentenceCard: React.FC<{ entry: SentenceEntry; onDelete: (id: string) => void }> = ({ entry, onDelete }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-5 shadow-lg flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-brand-primary capitalize">Practice Sentence</h3>
            <ProficiencyStars score={entry.proficiency} />
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-medium-text">Vietnamese:</p>
            <p className="text-light-text pl-2 border-l-2 border-dark-border">{entry.vietnameseSentence}</p>
          </div>
          
          <div>
            <p className="text-xs text-medium-text">English:</p>
            <p className="font-semibold text-light-text pl-2 border-l-2 border-brand-secondary">{entry.englishSentence}</p>
          </div>
        </div>
      </div>
      <div className="text-right mt-4">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-400 hover:text-red-300 text-xs font-semibold"
        >
          DELETE
        </button>
      </div>
    </div>
  );
};


export const ReviewSentenceList: React.FC<ReviewSentenceListProps> = ({ sentenceList, deleteSentenceEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = sentenceList.filter(
    (entry) =>
      entry.vietnameseSentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.englishSentence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sentenceList.length === 0) {
    return (
      <div className="text-center p-10 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
        <h2 className="text-2xl font-bold text-medium-text">Your sentence list is empty.</h2>
        <p className="text-light-text mt-2">Start by adding new sentences to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a sentence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-dark-card border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
        />
        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-medium-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredList.map((entry) => (
          <SentenceCard key={entry.id} entry={entry} onDelete={deleteSentenceEntry} />
        ))}
      </div>
    </div>
  );
};
