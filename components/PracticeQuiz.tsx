
import React, { useState, useEffect, useMemo } from 'react';
import type { VocabularyEntry, UserProfile } from '../types';
import { FillInTheBlankInput } from './FillInTheBlankInput';
import { getExperienceToNextLevel } from '../App';

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

interface PracticeQuizProps {
    vocabList: VocabularyEntry[];
    setVocabList: React.Dispatch<React.SetStateAction<VocabularyEntry[]>>;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const PracticeQuiz: React.FC<PracticeQuizProps> = ({ vocabList, setVocabList, userProfile, setUserProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledList, setShuffledList] = useState<VocabularyEntry[]>([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastGainedExp, setLastGainedExp] = useState(0);

  // Memoize the string of IDs to prevent re-shuffling on proficiency updates.
  // This effect will now only run when words are added or removed.
  const vocabListIds = useMemo(() => vocabList.map(entry => entry.id).sort().join(','), [vocabList]);

  useEffect(() => {
    if (vocabList.length > 0) {
      // Sort by proficiency (ascending) so users practice harder words first
      const sorted = [...vocabList].sort((a, b) => a.proficiency - b.proficiency);
      setShuffledList(sorted);
    } else {
      setShuffledList([]);
    }
    setCurrentIndex(0);
    resetState();
  }, [vocabListIds]);

  const currentEntry = useMemo(() => {
    return shuffledList.length > 0 ? shuffledList[currentIndex] : null;
  }, [shuffledList, currentIndex]);
  
  const questionSentence = useMemo(() => {
    if (!currentEntry) return '';

    const sentenceToUse = currentEntry.originalSentence;
    const wordToReplace = currentEntry.targetWord;

    const escapedWord = escapeRegExp(wordToReplace);
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');

    return sentenceToUse.replace(regex, '______');
  }, [currentEntry]);

  const resetState = () => {
    setAnswer('');
    setFeedback(null);
    setLastGainedExp(0);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledList.length);
    resetState();
  };

  const updateStats = (isCorrect: boolean) => {
    if (!currentEntry) return;

    const { proficiency, id } = currentEntry;
    
    // Calculate EXP gain/loss
    const baseExpGain = Math.max(1, 10 - (proficiency * 2)); // More exp for less proficient words
    const expChange = isCorrect ? baseExpGain : -Math.round(baseExpGain * 0.8);
    setLastGainedExp(expChange);

    // Update user profile
    let newExp = Math.max(0, userProfile.exp + expChange);
    let newLevel = userProfile.level;
    let expToNextLevel = getExperienceToNextLevel(newLevel);

    while (newExp >= expToNextLevel) {
        newExp -= expToNextLevel;
        newLevel++;
        expToNextLevel = getExperienceToNextLevel(newLevel);
    }
    setUserProfile({ level: newLevel, exp: newExp });
    
    // Update vocabulary entry proficiency
    const newProficiency = isCorrect 
        ? Math.min(5, proficiency + 1)
        : Math.max(1, proficiency - 1);
        
    // Update the master list for persistence through App state
    setVocabList(prevList => 
        prevList.map(item => item.id === id ? { ...item, proficiency: newProficiency } : item)
    );
    
    // Also update the local shuffled list to reflect the change immediately
    // without triggering a full re-shuffle.
    setShuffledList(prevList =>
        prevList.map(item => item.id === id ? { ...item, proficiency: newProficiency } : item)
    );
  };


  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry) return;

    const isCorrect = answer.trim().toLowerCase() === currentEntry.targetWord.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
    updateStats(isCorrect);
  };

  if (vocabList.length === 0) {
    return (
      <div className="text-center p-10 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
        <h2 className="text-2xl font-bold text-medium-text">Nothing to practice yet.</h2>
        <p className="text-light-text mt-2">Add some words to your list to start a quiz.</p>
      </div>
    );
  }

  if (!currentEntry) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="p-6 bg-dark-card rounded-lg border border-dark-border animate-slide-up">
      <div className="mb-2 text-sm text-medium-text flex justify-between">
        <span>Question {currentIndex + 1} of {shuffledList.length}</span>
        <span>
            Proficiency: {'★'.repeat(currentEntry.proficiency)}{'☆'.repeat(5 - currentEntry.proficiency)}
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-light mb-8 text-center leading-relaxed">
        {questionSentence}
      </h2>
      <form onSubmit={checkAnswer} className="flex flex-col items-center gap-4">
        <FillInTheBlankInput
            length={currentEntry.targetWord.length}
            value={answer}
            onChange={setAnswer}
            disabled={feedback !== null}
        />
        <button
          type="submit"
          disabled={feedback !== null || answer.trim().length !== currentEntry.targetWord.length}
          className="px-8 py-3 mt-4 bg-brand-primary hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-md transition w-full max-w-xs"
        >
          Check
        </button>
      </form>
      
      {feedback && (
        <div className="mt-6 text-center animate-fade-in">
          {feedback === 'correct' && (
            <div className="p-4 bg-green-500/20 text-green-300 rounded-md">
              <strong className="font-bold">Correct!</strong> You gained {lastGainedExp} EXP.
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="p-4 bg-red-500/20 text-red-300 rounded-md">
              <p><strong className="font-bold">Not quite.</strong> Lost {Math.abs(lastGainedExp)} EXP.</p>
              <p className="mt-2">The correct answer is: <strong className="text-brand-primary font-semibold">{currentEntry.targetWord}</strong></p>
            </div>
          )}
           <button onClick={handleNext} className="mt-4 px-8 py-2 bg-brand-secondary hover:bg-purple-500 text-white font-bold rounded-md transition">
              Next Word &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
