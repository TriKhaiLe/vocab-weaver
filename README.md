# Vocab Weaver

Vocab Weaver is an AI-powered English learning application designed to help users memorize vocabulary and sentences through creative context and interactive practice.

## Features

- **Vocabulary Weaver**: Select words from any sentence and generate memorable, rhyming contexts using Gemini AI.
- **Sentence Shaper**: Translate Vietnamese thoughts into natural English with customizable style guidance.
- **Interactive Practice**:
  - Fill-in-the-blank quizzes for vocabulary.
  - Voice-enabled translation practice for sentences.
- **Progression System**: Earn EXP, level up, and unlock visual rank themes from Bronze to Radiant Platinum.
- **User Authentication**: Secure login integration with backend API (optional - can continue without login for local-only storage).
- **Data Privacy**: Export and import your learning progress via signed JSON backups.

## Local Setup & Development

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- A Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))
- (Optional) Backend Quiz Game Proxy Server running for authentication features

### 2. Installation

Clone this repository and install the dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root (or copy from `.env.example`):

```env
# Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (optional, defaults to http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

**Note:** The legacy `API_KEY` environment variable is also supported for backward compatibility.

### 4. Running the Application

Start the local development server:

```bash
npm run dev
```

The app will typically run at `http://localhost:5173`.

## Authentication

The app supports optional user authentication through the backend API:

- **With Login**: Sign in with your email and password to sync your progress across devices (requires backend server).
- **Without Login**: Choose "Continue without login" to use the app with local storage only. All data stays on your device.

To enable authentication features, ensure the Quiz Game Proxy Server backend is running and the `VITE_API_URL` environment variable is set correctly.

## Using the App (Hosted)

If you are using the app via a shared deployment, use the **Settings** section within the app to "Configure Gemini Key". This will prompt you to select your own API key from a paid GCP project.

## Security Note

The selected API key is handled securely by the platform. Ensure your GCP project has billing enabled for the Gemini API.
