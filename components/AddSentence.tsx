import React, { useState } from "react";
import { suggestEnglishSentence } from "../services/geminiService";
import type { SentenceEntry } from "../types";
import { Spinner } from "./Spinner";

interface AddSentenceProps {
  addSentenceEntry: (entry: Omit<SentenceEntry, "id">) => void;
}

export const AddSentence: React.FC<AddSentenceProps> = ({
  addSentenceEntry,
}) => {
  const [vietnameseSentence, setVietnameseSentence] = useState("");
  const [guidance, setGuidance] = useState("");
  const [englishSentence, setEnglishSentence] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!vietnameseSentence) {
      setError("Please enter a Vietnamese sentence first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEnglishSentence(null);
    try {
      const result = await suggestEnglishSentence(vietnameseSentence, guidance);
      setEnglishSentence(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllState = () => {
    setVietnameseSentence("");
    setGuidance("");
    setEnglishSentence(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!vietnameseSentence || !englishSentence) {
      setError(
        "Missing information. Please generate a sentence before saving.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newEntry: Omit<SentenceEntry, "id"> = {
        vietnameseSentence,
        englishSentence,
        proficiency: 1, // Initialize proficiency at 1
      };
      addSentenceEntry(newEntry);
      resetAllState();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-md">{error}</div>
      )}

      {/* Step 1: Input */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="vietnamese-input"
            className="block text-lg font-semibold text-brand-primary mb-2"
          >
            Enter a Vietnamese Sentence
          </label>
          <textarea
            id="vietnamese-input"
            value={vietnameseSentence}
            onChange={(e) => setVietnameseSentence(e.target.value)}
            placeholder="Nhập câu tiếng Việt của bạn ở đây..."
            className="w-full h-24 p-3 bg-dark-bg border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          />
        </div>
        <div>
          <label
            htmlFor="guidance-input"
            className="block text-lg font-semibold text-brand-primary mb-2"
          >
            Style Guidance (Optional)
          </label>
          <input
            id="guidance-input"
            type="text"
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="e.g., formal, friendly, use a metaphor..."
            className="w-full p-3 bg-dark-bg border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          />
        </div>
      </div>

      {/* Step 2: Generate */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !vietnameseSentence}
          className="w-full md:w-auto bg-brand-secondary hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
        >
          {isLoading ? <Spinner /> : "Suggest English Sentence"}
        </button>
      </div>

      {/* Result Display */}
      {isLoading && !englishSentence && (
        <div className="flex justify-center items-center p-6 text-medium-text">
          <Spinner />
          <span className="ml-2">Generating...</span>
        </div>
      )}

      {englishSentence && (
        <div className="p-6 bg-dark-card rounded-lg border border-dark-border animate-fade-in">
          <h3 className="text-lg font-semibold text-brand-primary mb-3">
            Suggested Translation:
          </h3>
          <blockquote className="text-xl italic p-4 bg-dark-bg border-l-4 border-brand-primary rounded-r-lg">
            {englishSentence}
          </blockquote>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 bg-dark-border hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {isLoading ? <Spinner /> : "Regenerate"}
            </button>
            <button
              onClick={handleSave}
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
