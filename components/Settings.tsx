
import React, { useRef, useState, useEffect } from 'react';
import type { UserProfile, VocabularyEntry, SentenceEntry, AppBackup } from '../types';
import { signData, verifyData } from '../services/backupService';
import { Spinner } from './Spinner';

// Fix: Augment the existing AIStudio interface to add missing methods. 
// We do not re-declare 'aistudio' on 'Window' to avoid modifier and type conflicts with the environment's own declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

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
  if (!obj || typeof obj !== 'object' || !obj.data || !obj.signature) return false;
  const { data } = obj;
  if (!data.userProfile || typeof data.userProfile.level !== 'number' || typeof data.userProfile.exp !== 'number') return false;
  if (!Array.isArray(data.vocabList)) return false;
  if (!Array.isArray(data.sentenceList)) return false;
  return true;
};

export const Settings: React.FC<SettingsProps> = ({ userProfile, vocabList, sentenceList, setUserProfile, setVocabList, setSentenceList, showToast }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
    // Check periodically for changes
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        showToast('API Key configuration opened.');
      } catch (err) {
        showToast('Failed to open key selector.');
      }
    } else {
      showToast('Key selection is not available in this environment.');
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const dataToSign = { userProfile, vocabList, sentenceList };
      const dataString = JSON.stringify(dataToSign);
      const signature = await signData(dataString);
      const backup: AppBackup = { data: dataToSign, signature };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `vocab-weaver-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully!');
    } catch (error) {
      showToast('Error: Could not export data.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      if (!isBackupDataValid(parsedData)) throw new Error('Invalid backup format.');
      const dataString = JSON.stringify(parsedData.data);
      const isValid = await verifyData(dataString, parsedData.signature);
      if (!isValid) throw new Error('Verification failed. Backup may be tampered with.');
      setUserProfile(parsedData.data.userProfile);
      setVocabList(parsedData.data.vocabList);
      setSentenceList(parsedData.data.sentenceList);
      showToast('Data imported successfully!');
    } catch (error) {
      showToast(`Import Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${hasApiKey ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {hasApiKey ? 'Connected' : 'Action Required'}
            </span>
        </div>
        <p className="text-medium-text text-sm">
          To use AI features, you must provide your own API key from a paid Google Cloud project. 
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-1 text-brand-primary hover:underline">
            Learn more about billing.
          </a>
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white font-bold rounded-md transition shadow-lg"
        >
          <KeyIcon />
          Configure Gemini Key
        </button>
      </section>

      {/* Backup Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-light-text flex items-center gap-2">
            <DatabaseIcon />
            Data Backup & Migration
        </h3>
        <p className="text-medium-text text-sm">
          Export your progress as a signed JSON file. This includes your vocabulary, sentences, and user level.
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
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/json" className="hidden" />
        </div>
      </section>
    </div>
  );
};

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
    </svg>
);

const DatabaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3a1 1 0 011 1v5.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 9.586V4a1 1 0 011-1z" />
        <path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 17a1 1 0 001-1v-5.586l2.293 2.293a1 1 0 101.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 101.414 1.414L9 10.414V16a1 1 0 001 1z" />
        <path d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
);
