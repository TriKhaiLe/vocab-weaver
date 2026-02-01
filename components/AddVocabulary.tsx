import React, { useState, useMemo } from "react";
import {
  generateWordUsageExplanation,
  getWordLemma,
  translateToVietnamese,
  checkWordSpelling,
} from "../services/geminiService";
import type { VocabularyEntry } from "../types";
import { Spinner } from "./Spinner";

interface AddVocabularyProps {
  addVocabularyEntry: (entry: Omit<VocabularyEntry, "id">) => void;
}

export const AddVocabulary: React.FC<AddVocabularyProps> = ({
  addVocabularyEntry,
}) => {
  const [sentence, setSentence] = useState("");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null,
  );
  const [generatedSentence, setGeneratedSentence] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [translatedInput, setTranslatedInput] = useState<string | null>(null);
  const [translatedGenerated, setTranslatedGenerated] = useState<string | null>(
    null,
  );
  const [isTranslatingInput, setIsTranslatingInput] = useState(false);
  const [isTranslatingGenerated, setIsTranslatingGenerated] = useState(false);

  const [isCheckingSpelling, setIsCheckingSpelling] = useState(false);
  const [spellingError, setSpellingError] = useState<string | null>(null);
  const [spellingSuggestions, setSpellingSuggestions] = useState<string[]>([]);

  const words = useMemo(
    () => sentence.split(/\s+/).filter(Boolean),
    [sentence],
  );
  const characterLimit = 400;

  const handleWordClick = async (word: string, index: number) => {
    const cleanedWord = word.replace(/[.,!?;:)]+$/, "");
    setSelectedWord(cleanedWord);
    setSelectedWordIndex(index);
    setGeneratedSentence(null);
    setTranslatedGenerated(null);
    setSpellingError(null);
    setSpellingSuggestions([]);

    if (cleanedWord) {
      setIsCheckingSpelling(true);
      try {
        const { isValid, suggestions } = await checkWordSpelling(cleanedWord);
        if (!isValid) {
          setSpellingError(
            `'${cleanedWord}' might be misspelled or not a valid English word.`,
          );
          setSpellingSuggestions(suggestions);
        }
      } catch (err) {
        console.error("Spelling check failed:", err);
      } finally {
        setIsCheckingSpelling(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (selectedWordIndex === null) return;

    const originalWordWithPunctuation = words[selectedWordIndex];
    const originalCleanedWord = originalWordWithPunctuation.replace(
      /[.,!?;:)]+$/,
      "",
    );
    const updatedWord = originalWordWithPunctuation.replace(
      originalCleanedWord,
      suggestion,
    );

    const newWords = [...words];
    newWords[selectedWordIndex] = updatedWord;

    setSentence(newWords.join(" "));
    setSelectedWord(suggestion);
    setSpellingError(null);
    setSpellingSuggestions([]);
  };

  const handleGenerate = async () => {
    if (!selectedWord) {
      setError("Please select a word first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedSentence(null);
    setTranslatedGenerated(null);
    try {
      const result = await generateWordUsageExplanation(selectedWord);
      setGeneratedSentence(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllState = () => {
    setSentence("");
    setSelectedWord(null);
    setSelectedWordIndex(null);
    setGeneratedSentence(null);
    setTranslatedInput(null);
    setTranslatedGenerated(null);
    setSpellingError(null);
    setSpellingSuggestions([]);
  };

  const handleSave = async (withGeneratedSentence: boolean) => {
    if (!selectedWord || !sentence) {
      setError("Missing information. Please complete all steps.");
      return;
    }
    if (withGeneratedSentence && !generatedSentence) {
      setError(
        "Generated sentence is missing. Please generate one before saving.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const baseWord = await getWordLemma(selectedWord);
      const newEntry: Omit<VocabularyEntry, "id"> = {
        originalSentence: sentence,
        targetWord: selectedWord,
        baseWord,
        proficiency: 1, // Initialize proficiency at 1
        ...(translatedInput && {
          originalSentenceTranslation: translatedInput,
        }),
        ...(withGeneratedSentence && { generatedSentence: generatedSentence! }),
      };

      addVocabularyEntry(newEntry);
      resetAllState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateInput = async () => {
    if (!sentence) return;
    setIsTranslatingInput(true);
    setError(null);
    try {
      const translation = await translateToVietnamese(sentence);
      setTranslatedInput(translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setIsTranslatingInput(false);
    }
  };

  const handleTranslateGenerated = async () => {
    if (!generatedSentence) return;
    setIsTranslatingGenerated(true);
    setError(null);
    try {
      const translation = await translateToVietnamese(generatedSentence);
      setTranslatedGenerated(translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed.");
    } finally {
      setIsTranslatingGenerated(false);
    }
  };

  const TranslateIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 21l-5.25-5.25m0 0L10.5 10.5m-5.25 5.25h15m-15 0l5.25 5.25M3.75 4.5h15m-15 0l5.25 5.25M3.75 4.5l5.25-5.25"
      />
    </svg>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-md">{error}</div>
      )}

      {/* Step 1: Input Sentence */}
      <div className="p-6 bg-dark-card rounded-lg border border-dark-border">
        <div className="flex justify-between items-center mb-3">
          <label
            htmlFor="sentence-input"
            className="block text-lg font-semibold text-brand-primary"
          >
            Step 1: Enter a sentence
          </label>
          <button
            onClick={handleTranslateInput}
            disabled={!sentence || isTranslatingInput}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-dark-border hover:bg-brand-secondary/50 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslatingInput ? <Spinner /> : <TranslateIcon />}
            <span>Translate</span>
          </button>
        </div>
        <div className="relative">
          <textarea
            id="sentence-input"
            value={sentence}
            onChange={(e) => {
              setSentence(e.target.value);
              setTranslatedInput(null);
              setSelectedWord(null);
              setSelectedWordIndex(null);
              setSpellingError(null);
              setSpellingSuggestions([]);
            }}
            placeholder="Enter a sentence you've read or heard..."
            className="w-full h-24 p-3 pr-16 bg-dark-bg border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
            maxLength={characterLimit}
          />
          <div
            className={`absolute bottom-2 right-3 text-xs pointer-events-none ${
              sentence.length >= characterLimit
                ? "text-red-400"
                : sentence.length > characterLimit - 50
                  ? "text-yellow-400"
                  : "text-medium-text"
            }`}
          >
            {sentence.length} / {characterLimit}
          </div>
        </div>
        {translatedInput && (
          <div className="mt-4 p-3 bg-dark-bg rounded-md border border-dark-border animate-fade-in">
            <p className="text-xs text-medium-text">Vietnamese Translation:</p>
            <p className="text-light-text italic">{translatedInput}</p>
          </div>
        )}
      </div>

      {/* Step 2: Select a word */}
      {sentence && (
        <div className="p-6 bg-dark-card rounded-lg border border-dark-border">
          <h2 className="text-lg font-semibold mb-3 text-brand-primary">
            Step 2: Select the word to learn
          </h2>
          <div className="flex flex-wrap gap-2 p-4 bg-dark-bg rounded-md">
            {words.map((word, index) => (
              <span
                key={index}
                onClick={() => handleWordClick(word, index)}
                className={`cursor-pointer p-2 rounded-md transition duration-200 ${
                  index === selectedWordIndex
                    ? "bg-brand-primary text-white font-bold"
                    : "bg-dark-border hover:bg-brand-secondary/50"
                }`}
              >
                {word}
              </span>
            ))}
          </div>
          {selectedWord && (
            <div className="mt-4">
              {isCheckingSpelling && (
                <div className="flex items-center text-medium-text p-2 animate-fade-in">
                  <Spinner />
                  <span className="ml-2">Checking spelling...</span>
                </div>
              )}
              {spellingError && !isCheckingSpelling && (
                <div className="p-3 bg-yellow-500/20 text-yellow-300 rounded-md animate-fade-in border border-yellow-500/30">
                  <p className="font-semibold">{spellingError}</p>
                  {spellingSuggestions.length > 0 && (
                    <div className="mt-2">
                      <span className="mr-2 text-sm">Did you mean:</span>
                      {spellingSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 mr-2 text-sm bg-dark-border hover:bg-yellow-600/50 rounded-md transition"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {selectedWord && !generatedSentence && (
            <div className="mt-6 text-center">
              <button
                onClick={() => handleSave(false)}
                disabled={isLoading || !!spellingError}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
              >
                {isLoading ? <Spinner /> : `Save "${selectedWord}"`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Generate Usage Explanation */}
      {selectedWord && (
        <div className="p-6 bg-dark-card rounded-lg border border-dark-border text-center">
          <h2 className="text-lg font-semibold mb-4 text-brand-primary">
            Step 3 (Optional): Learn when "{selectedWord}" is typically used
          </h2>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !!spellingError}
            className="w-full md:w-auto bg-brand-secondary hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
          >
            {isLoading && !generatedSentence ? <Spinner /> : "Explain Usage"}
          </button>
        </div>
      )}

      {/* Generated Sentence Display */}
      {isLoading && !generatedSentence && selectedWord && (
        <div className="flex justify-center items-center p-6 text-medium-text">
          <Spinner />
          <span className="ml-2">Loading...</span>
        </div>
      )}

      {generatedSentence && (
        <div className="p-6 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-brand-primary">
              Usage Explanation:
            </h3>
            <button
              onClick={handleTranslateGenerated}
              disabled={!generatedSentence || isTranslatingGenerated}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-dark-border hover:bg-brand-secondary/50 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslatingGenerated ? <Spinner /> : <TranslateIcon />}
              <span>Translate</span>
            </button>
          </div>

          <div className="text-base p-4 bg-dark-bg border-l-4 border-brand-primary rounded-r-lg leading-relaxed">
            {generatedSentence}
          </div>

          {translatedGenerated && (
            <div className="mt-4 p-3 bg-dark-bg rounded-md border border-dark-border animate-fade-in">
              <p className="text-xs text-medium-text">
                Vietnamese Translation:
              </p>
              <p className="text-light-text italic">{translatedGenerated}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 bg-dark-border hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {isLoading ? <Spinner /> : "Regenerate"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {isLoading ? <Spinner /> : "Looks good, Save!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
