
import React, { useState } from 'react';
import type { VocabularyEntry } from '../types';

interface ReviewListProps {
  vocabList: VocabularyEntry[];
  deleteVocabularyEntry: (id: string) => void;
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

const VocabCard: React.FC<{ entry: VocabularyEntry; onDelete: (id: string) => void }> = ({ entry, onDelete }) => {
  const [isTranslationVisible, setIsTranslationVisible] = useState(false);
  
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-5 shadow-lg flex flex-col justify-between animate-slide-up">
      <div>
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-brand-primary capitalize">{entry.baseWord}</h3>
            <ProficiencyStars score={entry.proficiency} />
        </div>
        <p className="text-sm text-medium-text mb-4">(Learned as: <span className="italic">"{entry.targetWord}"</span>)</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-medium-text">Original Sentence:</p>
              {entry.originalSentenceTranslation && (
                 <button 
                  onClick={() => setIsTranslationVisible(!isTranslationVisible)}
                  className="text-xs px-2 py-1 rounded bg-dark-border hover:bg-brand-secondary/50 transition-colors"
                >
                  {isTranslationVisible ? 'Hide' : 'Show'} Translation
                </button>
              )}
            </div>
            <p className="text-light-text pl-2 border-l-2 border-dark-border">{entry.originalSentence}</p>
            {isTranslationVisible && entry.originalSentenceTranslation && (
              <div className="mt-2 pl-2 border-l-2 border-dark-border animate-fade-in">
                 <p className="text-medium-text italic">{entry.originalSentenceTranslation}</p>
              </div>
            )}
          </div>
          
          {entry.generatedSentence && (
            <div>
              <p className="text-xs text-medium-text">Generated Sentence:</p>
              <p className="font-semibold text-light-text pl-2 border-l-2 border-brand-secondary">{entry.generatedSentence}</p>
            </div>
          )}
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


export const ReviewList: React.FC<ReviewListProps> = ({ vocabList, deleteVocabularyEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredList = vocabList.filter(
    (entry) =>
      entry.baseWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.targetWord.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (vocabList.length === 0) {
    return (
      <div className="text-center p-10 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
        <h2 className="text-2xl font-bold text-medium-text">Your vocabulary list is empty.</h2>
        <p className="text-light-text mt-2">Start by adding new words to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a word..."
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
          <VocabCard key={entry.id} entry={entry} onDelete={deleteVocabularyEntry} />
        ))}
      </div>
    </div>
  );
};