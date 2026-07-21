# HaiLo - Mental Health & Wellness Companion 🌟

A comprehensive wellness companion app for students focused on mental health support, mood tracking, and personalized video recommendations. Built with Expo, React Native, and AI-powered content curation.

## 📱 What is HaiLo?

HaiLo is a mental health support application designed to help students manage stress, anxiety, and depression through:

- **Mood Check-ins**: Interactive chatbot that asks targeted questions about your mental state
- **Intelligent Recommendations**: AI-powered mood scoring system that suggests relevant wellness videos
- **Video Library**: Curated mental health content with AI-generated summaries, tips, and action plans
- **Progress Dashboard**: Track your mental health journey over time
- **Sobriety Tracker**: Monitor recovery progress with streak-based incentives (future feature)

### Architecture Highlights

This app demonstrates production-ready architecture patterns:

- **Service Layer Architecture**: Clean separation between UI, business logic, and data layers
- **Real Business Logic**: Mood scoring algorithms, video recommendation engine, and data aggregation
- **GraphQL API**: Apollo Client integration for backend communication
- **Persistent Storage**: Expo SQLite for local data persistence
- **Comprehensive Testing**: 96%+ code coverage with Jest and React Native Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- iOS Simulator (Mac only) or Android Emulator
- [LM Studio](https://lmstudio.ai/) (for AI-powered video summaries)

### Installation

1. **Clone the repository and install dependencies**

   ```bash
   cd HaiLo
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run the app**

   In the terminal output, you'll see options to open the app:

   - Press `i` for iOS Simulator (Mac only)
   - Press `a` for Android Emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your physical device

   Or use these direct commands:

   ```bash
   npm run ios       # iOS Simulator
   npm run android   # Android Emulator
   npm run web       # Web browser
   ```

## 🤖 Setting Up LM Studio (AI Integration)

LM Studio provides local AI capabilities for generating video summaries and wellness tips.

### Installation & Setup

1. **Download LM Studio**
   - Visit [lmstudio.ai](https://lmstudio.ai/) and download for your platform
   - Install and launch the application

2. **Download a Model**
   - Open LM Studio and go to the "Search" tab
   - Download a recommended model like:
     - `TheBloke/Mistral-7B-Instruct-v0.2-GGUF`
     - `TheBloke/Llama-2-7B-Chat-GGUF`
     - Any other instruct/chat model (7B-13B recommended for performance)

3. **Start the Local Server**
   - In LM Studio, go to the "Local Server" tab
   - Click "Start Server"
   - Ensure it's running on `http://localhost:1234` (default port)
   - The status should show "Server Running"

4. **Generate Video Summaries**

   Once LM Studio is running, generate AI summaries for wellness videos:

   ```bash
   node scripts/summarize-videos.mjs
   ```

   This script will:
   - Fetch YouTube transcripts for curated mental health videos
   - Send them to LM Studio for AI summarization
   - Generate actionable tips and recovery plans
   - Cache results in `scripts/video-summaries.json`

### Troubleshooting LM Studio

- **Connection refused**: Ensure LM Studio server is running on port 1234
- **Slow responses**: Try a smaller model (7B parameters) or reduce max_tokens
- **JSON parsing errors**: The script includes robust parsing to handle various response formats
- **Port conflicts**: Check if another service is using port 1234

## 🧪 Running Tests

This project includes comprehensive unit tests with excellent coverage.

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test recoveryService.test.ts
```

### Test Coverage

Current coverage statistics:

```
Test Suites: 3 passed, 3 total
Tests:       39 passed, 39 total

Coverage:
- Controllers:  100%   (Full coverage)
- Services:     96.42% (Excellent coverage)  
- Utilities:    81.81% (Good coverage)
```

### Test Structure

```
__tests__/
├── api/
│   ├── controllers/
│   │   └── recoveryController.test.ts    # API controller tests
│   └── services/
│       └── recoveryService.test.ts       # Business logic tests
└── utils/
    └── loadVideoSummaries.test.ts        # Utility function tests
```

### What's Tested

- ✅ Mood scoring algorithms
- ✅ Video recommendation engine
- ✅ Dashboard data aggregation
- ✅ Check-in validation and processing
- ✅ Error handling and edge cases
- ✅ Data persistence layer
- ✅ API client integration

View detailed test documentation in [TESTING.md](TESTING.md).

## 📂 Project Structure

```
src/
├── api/
│   ├── client/              # Apollo GraphQL client setup
│   ├── controllers/         # Request handlers and routing
│   ├── services/            # Core business logic
│   └── utils/               # Helper functions
├── app/
│   ├── index.tsx            # Home/Dashboard screen
│   ├── chatbot.tsx          # Mood check-in flow
│   └── explore.tsx          # Resources & community
├── components/              # Reusable UI components
├── constants/               # Theme and configuration
└── hooks/                   # Custom React hooks
```

## 🏗️ Architecture Overview

### Three-Layer Architecture

1. **Presentation Layer** (`src/app/`, `src/components/`)
   - React Native screens and UI components
   - User interaction and input handling

2. **Business Logic Layer** (`src/api/services/`)
   - `recoveryService.ts`: Mood scoring, recommendations, streak calculations
   - Pure business logic, framework-agnostic
   - Highly testable with comprehensive unit tests

3. **Data Layer** (`src/api/client/`)
   - Apollo Client for GraphQL communication
   - Expo SQLite for local persistence
   - Data transformation and caching

### Key Features

- **Mood Scoring Algorithm**: Converts check-in responses into actionable mood states
- **Recommendation Engine**: Matches mood scores to relevant wellness content
- **Data Persistence**: SQLite ensures data survives app restarts
- **Type Safety**: Full TypeScript coverage for reliability

## 📚 Additional Resources

- [Flow Documentation](flow_documentation.md) - Detailed user flows and backend architecture
- [HaiLo Plan](releaseu_plan.md) - Product roadmap and feature planning
- [Testing Guide](TESTING.md) - Comprehensive testing documentation
- [Expo Documentation](https://docs.expo.dev/) - Official Expo framework docs

## 🛠️ Development

### Available Scripts

```bash
npm start              # Start Expo development server
npm run ios            # Run on iOS Simulator
npm run android        # Run on Android Emulator
npm run web            # Run in web browser
npm test               # Run test suite
npm run reset-project  # Reset to blank template
```

### Tech Stack

- **Framework**: Expo SDK 57, React Native 0.86
- **Language**: TypeScript 6.0
- **State Management**: Apollo Client with GraphQL
- **Database**: Expo SQLite
- **Testing**: Jest, React Native Testing Library
- **AI Integration**: LM Studio (local inference)

