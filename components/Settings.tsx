import React, { useRef, useState, useEffect } from "react";
import type {
  UserProfile,
  VocabularyEntry,
  SentenceEntry,
  AppBackup,
} from "../types";
import { signData, verifyData } from "../services/backupService";
import { Spinner } from "./Spinner";

const GEMINI_API_KEY_STORAGE_KEY = "vocab-weaver-gemini-api-key";

interface SettingsProps {
  userProfile: UserProfile;
  vocabList: VocabularyEntry[];
  sentenceList: SentenceEntry[];
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setVocabList: React.Dispatch<React.SetStateAction<VocabularyEntry[]>>;
  setSentenceList: React.Dispatch<React.SetStateAction<SentenceEntry[]>>;
  showToast: (message: string) => void;
}

const isBackupDataValid = (obj: any): obj is AppBackup => {
  if (!obj || typeof obj !== "object" || !obj.data || !obj.signature)
    return false;
  const { data } = obj;
  if (
    !data.userProfile ||
    typeof data.userProfile.level !== "number" ||
    typeof data.userProfile.exp !== "number"
  )
    return false;
  if (!Array.isArray(data.vocabList)) return false;
  if (!Array.isArray(data.sentenceList)) return false;
  return true;
};

export const Settings: React.FC<SettingsProps> = ({
  userProfile,
  vocabList,
  sentenceList,
  setUserProfile,
  setVocabList,
  setSentenceList,
  showToast,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKeyInput(storedKey);
      setHasApiKey(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmedKey = apiKeyInput.trim();
    if (trimmedKey) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmedKey);
      setHasApiKey(true);
      showToast("API Key saved successfully!");
    } else {
      showToast("Please enter a valid API key.");
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
    setApiKeyInput("");
    setHasApiKey(false);
    setShowApiKey(false);
    showToast("API Key removed.");
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const dataToSign = { userProfile, vocabList, sentenceList };
      const dataString = JSON.stringify(dataToSign);
      const signature = await signData(dataString);
      const backup: AppBackup = { data: dataToSign, signature };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `vocab-weaver-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Data exported successfully!");
    } catch (error) {
      showToast("Error: Could not export data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      if (!isBackupDataValid(parsedData))
        throw new Error("Invalid backup format.");
      const dataString = JSON.stringify(parsedData.data);
      const isValid = await verifyData(dataString, parsedData.signature);
      if (!isValid)
        throw new Error("Verification failed. Backup may be tampered with.");
      setUserProfile(parsedData.data.userProfile);
      setVocabList(parsedData.data.vocabList);
      setSentenceList(parsedData.data.sentenceList);
      showToast("Data imported successfully!");
    } catch (error) {
      showToast(
        `Import Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Key Section */}
      <section className="space-y-4 pb-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-light-text flex items-center gap-2">
            <KeyIcon />
            Gemini AI Connection
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${hasApiKey ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
          >
            {hasApiKey ? "Connected" : "Action Required"}
          </span>
        </div>
        <p className="text-medium-text text-sm">
          To use AI features, you need a Gemini API key.{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:underline font-medium"
          >
            Get your free API key here →
          </a>
        </p>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full px-4 py-3 pr-12 bg-dark-card border border-dark-border rounded-md text-light-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medium-text hover:text-light-text transition"
              title={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveApiKey}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold rounded-md transition shadow-lg"
            >
              <SaveIcon />
              Save API Key
            </button>
            {hasApiKey && (
              <button
                onClick={handleClearApiKey}
                className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-md transition border border-red-500/30"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          🔒 Your API key is stored locally in your browser and only used to
          communicate with Google's Gemini API.
        </p>
      </section>

      {/* Backup Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-light-text flex items-center gap-2">
          <DatabaseIcon />
          Data Backup & Migration
        </h3>
        <p className="text-medium-text text-sm">
          Export your progress as a signed JSON file. This includes your
          vocabulary, sentences, and user level.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-dark-border hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold rounded-md transition"
          >
            {isProcessing ? <Spinner /> : <ExportIcon />}
            Export Data
          </button>
          <button
            onClick={handleImportClick}
            disabled={isProcessing}
            className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-dark-border hover:bg-gray-600 disabled:bg-gray-700 text-white font-bold rounded-md transition"
          >
            {isProcessing ? <Spinner /> : <ImportIcon />}
            Import Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />
        </div>
      </section>
    </div>
  );
};

const KeyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const DatabaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
  </svg>
);

const ExportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 3a1 1 0 011 1v5.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 9.586V4a1 1 0 011-1z" />
    <path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const ImportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 17a1 1 0 001-1v-5.586l2.293 2.293a1 1 0 101.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 101.414 1.414L9 10.414V16a1 1 0 001 1z" />
    <path d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
      clipRule="evenodd"
    />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
);

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
  </svg>
);
