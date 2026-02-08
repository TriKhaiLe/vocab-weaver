import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { AddVocabulary } from "./components/AddVocabulary";
import { ReviewList } from "./components/ReviewList";
import { PracticeQuiz } from "./components/PracticeQuiz";
import { AddSentence } from "./components/AddSentence";
import { ReviewSentenceList } from "./components/ReviewSentenceList";
import { PracticeSentenceQuiz } from "./components/PracticeSentenceQuiz";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type {
  VocabularyEntry,
  UserProfile,
  SentenceEntry,
  AuthUser,
} from "./types";
import { NavigationTab } from "./types";
import { UserProfileBar } from "./components/UserProfileBar";
import { Accordion } from "./components/Accordion";
import { Settings } from "./components/Settings";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { Login } from "./components/Login";
import { authService } from "./services/authService";

// Simple leveling formula: 50 EXP to get to level 2, 100 for level 3, etc.
export const getExperienceToNextLevel = (level: number) => 50 * level;

export const getRank = (level: number) => {
  // --- Platinum Tier ---
  if (level >= 50)
    return {
      name: "Radiant Platinum",
      theme: {
        border: "border-cyan-300",
        bg: "bg-cyan-800/30",
        text: "text-cyan-200",
        shadow: "shadow-[0_0_20px_theme(colors.cyan.400)]",
      },
    };
  if (level >= 40)
    return {
      name: "Platinum",
      theme: {
        border: "border-cyan-400",
        bg: "bg-cyan-900/20",
        text: "text-cyan-300",
        shadow: "shadow-lg shadow-cyan-500/50",
      },
    };

  // --- Gold Tier ---
  if (level >= 30)
    return {
      name: "Polished Gold",
      theme: {
        border: "border-yellow-300",
        bg: "bg-yellow-800/30",
        text: "text-yellow-200",
        shadow: "shadow-lg shadow-yellow-400/50",
      },
    };
  if (level >= 20)
    return {
      name: "Gold",
      theme: {
        border: "border-yellow-400",
        bg: "bg-yellow-900/20",
        text: "text-yellow-300",
        shadow: "shadow-lg shadow-yellow-500/50",
      },
    };

  // --- Silver Tier (New Colors) ---
  if (level >= 15)
    return {
      name: "Sterling Silver",
      theme: {
        border: "border-sky-300",
        bg: "bg-sky-900/30",
        text: "text-sky-200",
        shadow: "shadow-lg shadow-sky-400/50",
      },
    };
  if (level >= 10)
    return {
      name: "Silver",
      theme: {
        border: "border-slate-400",
        bg: "bg-slate-800/20",
        text: "text-slate-300",
        shadow: "shadow-lg shadow-slate-500/50",
      },
    };

  // --- Bronze Tier ---
  if (level >= 5)
    return {
      name: "Polished Bronze",
      theme: {
        border: "border-orange-500",
        bg: "bg-orange-900/20",
        text: "text-orange-400",
        shadow: "shadow-lg shadow-orange-600/50",
      },
    };
  return {
    name: "Bronze",
    theme: {
      border: "border-yellow-800",
      bg: "bg-yellow-900/10",
      text: "text-yellow-700",
      shadow: "shadow-md shadow-yellow-800/50",
    },
  };
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.ADD);
  const [currentMode, setCurrentMode] = useState<"VOCAB" | "SENTENCE">("VOCAB");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [skipLogin, setSkipLogin] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const [vocabList, setVocabList] = useLocalStorage<VocabularyEntry[]>(
    "vocabList",
    [],
  );
  const [sentenceList, setSentenceList] = useLocalStorage<SentenceEntry[]>(
    "sentenceList",
    [],
  );
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>(
    "userProfile",
    { level: 1, exp: 0 },
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    const hasSkippedLogin =
      localStorage.getItem("vocab-weaver-skip-login") === "true";
    setAuthUser(storedUser);
    setSkipLogin(hasSkippedLogin);
    setIsAuthChecked(true);
  }, []);

  const handleLogin = useCallback((user: AuthUser | null) => {
    if (user === null) {
      // User chose to skip login
      setSkipLogin(true);
      localStorage.setItem("vocab-weaver-skip-login", "true");
    } else {
      setAuthUser(user);
      localStorage.removeItem("vocab-weaver-skip-login");
    }
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setAuthUser(null);
    setSkipLogin(false);
    localStorage.removeItem("vocab-weaver-skip-login");
    showToast("Logged out successfully");
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addVocabularyEntry = useCallback(
    (entry: Omit<VocabularyEntry, "id">) => {
      const newEntry: VocabularyEntry = {
        ...entry,
        id: new Date().toISOString() + Math.random(),
      };
      setVocabList((prevList) => [newEntry, ...prevList]);
      showToast("Vocabulary saved successfully!");
      setActiveTab(NavigationTab.REVIEW);
    },
    [setVocabList],
  );

  const deleteVocabularyEntry = useCallback(
    (id: string) => {
      setVocabList((prevList) => prevList.filter((entry) => entry.id !== id));
      showToast("Entry deleted.");
    },
    [setVocabList],
  );

  const addSentenceEntry = useCallback(
    (entry: Omit<SentenceEntry, "id">) => {
      const newEntry: SentenceEntry = {
        ...entry,
        id: new Date().toISOString() + Math.random(),
      };
      setSentenceList((prevList) => [newEntry, ...prevList]);
      showToast("Sentence pair saved successfully!");
      setActiveTab(NavigationTab.REVIEW);
    },
    [setSentenceList],
  );

  const deleteSentenceEntry = useCallback(
    (id: string) => {
      setSentenceList((prevList) =>
        prevList.filter((entry) => entry.id !== id),
      );
      showToast("Sentence pair deleted.");
    },
    [setSentenceList],
  );

  const rank = getRank(userProfile.level);

  const renderContent = () => {
    if (currentMode === "VOCAB") {
      switch (activeTab) {
        case NavigationTab.ADD:
          return <AddVocabulary addVocabularyEntry={addVocabularyEntry} />;
        case NavigationTab.REVIEW:
          return (
            <ReviewList
              vocabList={vocabList}
              deleteVocabularyEntry={deleteVocabularyEntry}
            />
          );
        case NavigationTab.PRACTICE:
          return (
            <PracticeQuiz
              vocabList={vocabList}
              setVocabList={setVocabList}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          );
        default:
          return <AddVocabulary addVocabularyEntry={addVocabularyEntry} />;
      }
    } else {
      switch (activeTab) {
        case NavigationTab.ADD:
          return <AddSentence addSentenceEntry={addSentenceEntry} />;
        case NavigationTab.REVIEW:
          return (
            <ReviewSentenceList
              sentenceList={sentenceList}
              deleteSentenceEntry={deleteSentenceEntry}
            />
          );
        case NavigationTab.PRACTICE:
          return (
            <PracticeSentenceQuiz
              sentenceList={sentenceList}
              setSentenceList={setSentenceList}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          );
        default:
          return <AddSentence addSentenceEntry={addSentenceEntry} />;
      }
    }
  };

  const expToNextLevel = getExperienceToNextLevel(userProfile.level);

  // Show loading while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-light-text">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated and user hasn't chosen to skip login
  if (!authUser && !skipLogin) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-dark-bg font-sans text-light-text">
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-6 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary text-transparent bg-clip-text mb-2">
                Vocab Weaver
              </h1>
              <p className="text-medium-text text-lg">
                Craft memorable connections with new words and sentences.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {authUser && (
                <div className="text-right">
                  <p className="text-sm text-medium-text mb-1">
                    {authUser.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <UserProfileBar
            level={userProfile.level}
            exp={userProfile.exp}
            expToNextLevel={expToNextLevel}
            rankName={rank.name}
          />
        </div>

        <ModeSwitcher
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
        />

        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentMode={currentMode}
        />

        {/* Fix: Removed the `style` attribute which was causing a TypeScript error as `shadowColor` does not exist. The shadow is already correctly applied by the `rank.theme.shadow` class. */}
        <main
          className={`mt-8 p-0.5 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary ${rank.theme.shadow} transition-shadow duration-500`}
        >
          <div
            className={`bg-dark-bg rounded-lg p-1 md:p-2 border ${rank.theme.border} transition-colors duration-500`}
          >
            <div
              className={`p-4 rounded-lg ${rank.theme.bg} transition-colors duration-500`}
            >
              {renderContent()}
            </div>
          </div>
        </main>

        <div
          className="mt-12 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <Accordion title="Application Settings" icon={<SettingsIcon />}>
            <Settings
              userProfile={userProfile}
              vocabList={vocabList}
              sentenceList={sentenceList}
              setUserProfile={setUserProfile}
              setVocabList={setVocabList}
              setSentenceList={setSentenceList}
              showToast={showToast}
            />
          </Accordion>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clipRule="evenodd"
    />
  </svg>
);

export default App;
