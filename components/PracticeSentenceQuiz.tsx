import React, { useState, useEffect, useMemo } from 'react';
import type { SentenceEntry, UserProfile } from '../types';
import { getExperienceToNextLevel } from '../App';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';


interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface PracticeSentenceQuizProps {
    sentenceList: SentenceEntry[];
    setSentenceList: React.Dispatch<React.SetStateAction<SentenceEntry[]>>;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const PracticeSentenceQuiz: React.FC<PracticeSentenceQuizProps> = ({ sentenceList, setSentenceList, userProfile, setUserProfile }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledList, setShuffledList] = useState<SentenceEntry[]>([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastGainedExp, setLastGainedExp] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const sentenceListIds = useMemo(() => sentenceList.map(entry => entry.id).sort().join(','), [sentenceList]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
        setIsSpeechSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                setSpeechError("Couldn't hear you. Please try again.");
            } else if (event.error === 'not-allowed') {
                setSpeechError("Microphone access was denied.");
            } else {
                 setSpeechError("An error occurred with speech recognition.");
            }
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const fullTranscript = Array.from(event.results)
              .map(result => result[0])
              .map(alternative => alternative.transcript)
              .join('');
            setAnswer(fullTranscript);
        };
        
        setSpeechRecognition(recognition);
    } else {
        setIsSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    if (sentenceList.length > 0) {
      const sorted = [...sentenceList].sort((a, b) => a.proficiency - b.proficiency);
      setShuffledList(sorted);
    } else {
      setShuffledList([]);
    }
    setCurrentIndex(0);
    resetState();
  }, [sentenceListIds]);

  const currentEntry = useMemo(() => {
    return shuffledList.length > 0 ? shuffledList[currentIndex] : null;
  }, [shuffledList, currentIndex]);

  const resetState = () => {
    setAnswer('');
    setFeedback(null);
    setLastGainedExp(0);
    setSpeechError(null);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shuffledList.length);
    resetState();
  };

  const handleToggleListening = () => {
    if (!speechRecognition) return;

    if (isListening) {
        speechRecognition.stop();
    } else {
        setAnswer(''); // Clear previous answer
        speechRecognition.start();
    }
  };

  const updateStats = (isFullyCorrect: boolean, expGained: number) => {
    if (!currentEntry) return;

    const { proficiency, id } = currentEntry;
    
    setLastGainedExp(expGained);

    let newExp = Math.max(0, userProfile.exp + expGained);
    let newLevel = userProfile.level;
    let expToNextLevel = getExperienceToNextLevel(newLevel);

    while (newExp >= expToNextLevel) {
        newExp -= expToNextLevel;
        newLevel++;
        expToNextLevel = getExperienceToNextLevel(newLevel);
    }
    setUserProfile({ level: newLevel, exp: newExp });
    
    const newProficiency = isFullyCorrect 
        ? Math.min(5, proficiency + 1)
        : Math.max(1, proficiency - 1); // Only penalize if completely wrong
        
    setSentenceList(prevList => 
        prevList.map(item => item.id === id ? { ...item, proficiency: newProficiency } : item)
    );
    
    setShuffledList(prevList =>
        prevList.map(item => item.id === id ? { ...item, proficiency: newProficiency } : item)
    );
  };

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry) return;
    if (isListening) {
      speechRecognition?.stop();
    }

    const correctWords = currentEntry.englishSentence.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    const userWords = answer.trim().toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    
    let correctWordCount = 0;
    const minLength = Math.min(correctWords.length, userWords.length);
    for (let i = 0; i < minLength; i++) {
        if (correctWords[i] === userWords[i]) {
            correctWordCount++;
        }
    }

    let expGained = correctWordCount;
    const isFullyCorrect = correctWords.join(' ') === userWords.join(' ');

    if (isFullyCorrect) {
        expGained += Math.ceil(correctWordCount * 0.5); // 50% bonus
        setFeedback('correct');
    } else {
        setFeedback('incorrect');
    }
    
    updateStats(isFullyCorrect, expGained);
  };

  if (sentenceList.length === 0) {
    return (
      <div className="text-center p-10 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
        <h2 className="text-2xl font-bold text-medium-text">Nothing to practice yet.</h2>
        <p className="text-light-text mt-2">Add some sentences to your list to start a quiz.</p>
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
      <div className="p-4 bg-dark-bg rounded-md mb-6">
        <p className="text-xs text-medium-text">Translate this sentence to English:</p>
        <h2 className="text-xl md:text-2xl font-light text-center leading-relaxed">
            "{currentEntry.vietnameseSentence}"
        </h2>
      </div>

      <form onSubmit={checkAnswer} className="flex flex-col items-center gap-4">
        <div className="relative w-full">
          <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={feedback !== null}
              placeholder="Type or speak the English translation..."
              className="w-full p-3 pr-12 bg-dark-bg border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition disabled:bg-gray-800"
              autoComplete="off"
          />
           {isSpeechSupported && (
              <button
                  type="button"
                  onClick={handleToggleListening}
                  disabled={feedback !== null}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                      isListening ? 'text-red-500 animate-pulse bg-red-500/20' : 'text-medium-text hover:text-light-text'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Use microphone"
              >
                  <MicrophoneIcon />
              </button>
          )}
        </div>
        {speechError && <p className="text-sm text-red-400 -mt-2">{speechError}</p>}
        {!isSpeechSupported && (
            <p className="text-xs text-medium-text -mt-2">Voice input is not supported by your browser.</p>
        )}
        <button
          type="submit"
          disabled={feedback !== null || answer.trim().length === 0}
          className="px-8 py-3 mt-4 bg-brand-primary hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-md transition w-full max-w-xs"
        >
          Check
        </button>
      </form>
      
      {feedback && (
        <div className="mt-6 text-center animate-fade-in">
          {feedback === 'correct' && (
            <div className="p-4 bg-green-500/20 text-green-300 rounded-md">
              <strong className="font-bold">Perfect!</strong> You gained {lastGainedExp} EXP.
            </div>
          )}
          {feedback === 'incorrect' && (
            <div className="p-4 bg-red-500/20 text-red-300 rounded-md">
              <p><strong className="font-bold">Not quite.</strong> You gained {lastGainedExp} EXP for the correct words.</p>
              <p className="mt-2">The correct answer is: <strong className="text-brand-primary font-semibold">{currentEntry.englishSentence}</strong></p>
            </div>
          )}
           <button onClick={handleNext} className="mt-4 px-8 py-2 bg-brand-secondary hover:bg-purple-500 text-white font-bold rounded-md transition">
              Next Sentence &rarr;
          </button>
        </div>
      )}
    </div>
  );
};


const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);