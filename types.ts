
export interface VocabularyEntry {
  id: string;
  originalSentence: string;
  originalSentenceTranslation?: string;
  targetWord: string; // The word as it appeared in the sentence
  baseWord: string; // The lemma/base form of the word
  generatedSentence?: string;
  proficiency: number; // Score from 1 (just learned) to 5 (mastered)
}

export interface SentenceEntry {
  id: string;
  vietnameseSentence: string;
  englishSentence: string;
  proficiency: number; // Score from 1 (just learned) to 5 (mastered)
}

export interface UserProfile {
  level: number;
  exp: number;
}

export enum NavigationTab {
  ADD = 'ADD',
  REVIEW = 'REVIEW',
  PRACTICE = 'PRACTICE',
}

export interface AppBackup {
  data: {
    userProfile: UserProfile;
    vocabList: VocabularyEntry[];
    sentenceList: SentenceEntry[];
  };
  signature: string;
}

export interface AuthUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}
