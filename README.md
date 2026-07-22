# HaiLo - AI-Powered Mental Health Support Platform 🌟

A mobile wellness application that helps users monitor their mental health and access personalized support resources when they need them most. Built with Expo, React Native, TanStack Query, and local LLM integration for AI-powered content generation.

**Key capabilities:**

- **Real-Time Risk Assessment**: Intelligent algorithm analyzes anxiety, stress, and depression scores to provide immediate feedback and recommendations
- **Personalized Content Delivery**: Shows relevant mental health videos and resources based on your current emotional state
- **AI-Generated Action Plans**: Uses LM Studio (local LLM) to generate personalized video summaries, actionable tips, and recovery strategies
- **Privacy-First Design**: All data stored locally on device using SQLite

### Core Features

- ✅ **Mood Check-In Questionnaire**: Track anxiety, stress, and depression levels on a 1-5 scale
- ✅ **Risk Level Assessment**: Sophisticated algorithm computes risk levels (high/moderate/low) with personalized recommendations
- ✅ **Smart Video Recommendations**: Displays curated mental health videos when scores indicate elevated distress (≥3)
- ✅ **AI-Powered Insights**: LM Studio integration generates personalized tips, tricks, and action plans from video content
- ✅ **Local Data Persistence**: SQLite database ensures your check-in history survives app restarts
- ✅ **GraphQL Ready**: Apollo Client integration for future backend API connectivity (with SQLite fallback)

### Architecture Highlights

This app demonstrates production-ready React Native development practices:

- **Three-Layer Architecture**: Clean separation between Presentation (UI), Business Logic (Services), and Data (Client) layers
- **Real Business Logic**: Risk assessment algorithm with computation, transformation, aggregation, and rule enforcement
- **Modern State Management**: TanStack Query for server state, React hooks for UI state
- **Type-Safe Development**: Full TypeScript coverage across all layers
- **Comprehensive Testing**: 96%+ code coverage with Jest and React Native Testing Library
- **GraphQL Integration**: Apollo Client for API communication with intelligent fallback patterns

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

## 🤖 Setting Up LM Studio (AI Content Generation)

LM Studio powers HaiLo's intelligent content summarization and personalized insight generation.

### Installation & Setup

1. **Download LM Studio**
   - Visit [lmstudio.ai](https://lmstudio.ai/) and download for your platform
   - Install and launch the application

2. **Download a Model**
   - Open LM Studio and go to the "Search" tab
   - Download a recommended model like:
     - `gemma-4-e2b`
     - `Qwen3.5 4B 4bit 4BIT`
     - Any other instruct/chat model (7B-13B recommended for performance)

3. **Start the Local Server**
   - In LM Studio, go to the "Local Server" tab
   - Click "Start Server"
   - Ensure it's running on `http://localhost:1234/v1` (default port)
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

This project includes comprehensive unit tests.

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
Tests:       66 passed, 66 total

Coverage:
- Controllers:  100%   (Full coverage)
- Services:     100%   (Full coverage - includes risk assessment)
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

- ✅ Risk assessment algorithm (high/moderate/low risk computation with edge cases)
- ✅ Check-in persistence (save and retrieve)
- ✅ GraphQL operations with fallback patterns
- ✅ Video summary loading and parsing
- ✅ Controller layer integration
- ✅ Error handling and edge cases
- ✅ Database initialization and table schema creation

## 📂 Project Structure

```
src/
├── api/
│   ├── client/              # Apollo GraphQL client setup
│   │   └── recoveryClient.ts
│   ├── controllers/         # Controller layer - connects UI to services
│   │   └── recoveryController.ts
│   ├── services/            # Business logic layer
│   │   └── recoveryService.ts  # Risk assessment, check-in persistence, GraphQL operations
│   ├── utils/               # Helper functions
│   │   └── home-summary.ts  # Video summary loader
│   └── types.ts             # TypeScript type definitions
├── app/
│   ├── _layout.tsx          # Root layout with TanStack Query provider
│   └── index.tsx            # Main screen with mood check-in and risk assessment
├── components/              # Reusable UI components
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ...
├── constants/               # Theme and configuration
│   └── theme.ts
└── hooks/                   # Custom React hooks
    └── use-theme.ts
```

## 🏗️ Architecture Overview

### Three-Layer Architecture

1. **Presentation Layer** (`src/app/`, `src/components/`)
   - React Native screens and UI components
   - TanStack Query hooks for data fetching and mutations
   - User interaction and input handling
   - Risk assessment display with color-coded badges

2. **Business Logic Layer** (`src/api/services/recoveryService.ts`)
   - `assessRiskLevel()`: Computes risk level from anxiety, stress, depression scores
   - `saveCheckIn()` / `getLastCheckIn()`: Local SQLite operations
   - `saveCheckInWithGraphQL()` / `getLastCheckInWithGraphQL()`: GraphQL operations with fallback
   - `getCurrentRiskAssessment()`: Retrieves and analyzes most recent check-in
   - Pure business logic, framework-agnostic
   - Highly testable with comprehensive unit tests

3. **Data Layer** (`src/api/client/recoveryClient.ts`)
   - Apollo Client for GraphQL communication
   - Expo SQLite for local persistence
   - GraphQL queries and mutations
   - Fallback patterns for offline-first functionality

### Key Implementation Details

**Risk Assessment Algorithm** (`assessRiskLevel` function):
- Analyzes three mental health metrics: anxiety, stress, depression (1-5 scale each)
- Computes total score, high score count, and average score
- **High Risk**: Total ≥ 12 OR 2+ scores ≥ 4 OR average ≥ 4
- **Moderate Risk**: Total ≥ 9 OR any score ≥ 4
- **Low Risk**: All other cases
- Returns risk level, personalized message, urgency level, and recommendation

**State Management Pattern**:
- **Server State** (TanStack Query): Video summaries, last check-in, risk assessment
- **UI State** (React useState): Current questionnaire responses
- **Mutations**: Check-in saves trigger automatic refetch of last check-in and risk assessment

**Video Recommendation Logic**:
- Videos only display when corresponding score ≥ 3 (elevated distress)
- Each video includes AI-generated tips & tricks and action plan
- Generated using LM Studio during build time (not runtime)

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
- **State Management**: TanStack Query v5 for server state, React hooks for UI state
- **Backend Integration**: Apollo Client with GraphQL (fallback to local SQLite)
- **Database**: Expo SQLite for local data persistence
- **Testing**: Jest 30, React Native Testing Library
- **AI Content Generation**: LM Studio (local LLM inference) for video summarization

## 💡 Project Motivation & Vision

### Why HaiLo?

Mental health support is often inaccessible to those who need it most. While therapy is an invaluable resource, many people face significant barriers:

- **Time constraints**: Busy schedules make it difficult to attend regular therapy sessions
- **Financial barriers**: The cost of therapy puts professional help out of reach for many
- **Immediate needs**: Sometimes you need quick, actionable guidance in the moment—not next week's appointment
- **Limited resources**: Many people lack access to adequate mental health support systems

HaiLo addresses these challenges by making mental health resources accessible, immediate, and free. Users can check in on their emotional state and instantly receive personalized wellness resources, action plans, and support—all from their phone, whenever they need it.

### AI in Healthcare:

Artificial Intelligence has made many advances in recent years, yet its potential in healthcare—particularly mental health—remains underutilized. This project represents a step towards that, demonstrating how AI can:

- **Democratize access** to mental health support
- **Provide immediate, personalized guidance** based on individual needs
- **Complement traditional therapy** with accessible daily check-ins and resources
- **Scale support** to reach more people without the constraints of traditional healthcare systems

Building HaiLo is my way of showcasing the transformative potential of AI in mental healthcare.

### Integration with Release U

Throughout development, I also envisioned how HaiLo could integrate seamlessly with the Release U platform to enhance student engagement and support. The combination of mental health check-ins with campus resources could create a comprehensive wellness ecosystem that encourages students to take an active role in their well-being.

## 🚀 Future Enhancements

Given more development time, I would expand HaiLo with these features:

### 1. Smart Conversational Check-In

Transform the static questionnaire into an **interactive rule-based chatbot** that adapts questions based on user responses using predetermined logic:

- Dynamic question flow that follows up on concerning responses based on predefined decision trees
- Branching logic that personalizes the conversation flow based on response patterns
- Adaptive pacing that adjusts based on user input (slower for detailed responses, faster for quick answers)

**Important**: This uses rule-based logic and predetermined decision trees—not AI-generated advice—to ensure safe, clinically-validated guidance without risk of incorrect AI recommendations.

**Impact**: More accurate emotional assessment through context-aware dialogue, leading to better-tailored resource recommendations while maintaining safety and clinical accuracy.

### 2. Progress Dashboard & Sobriety Tracking

A comprehensive **progress screen** where users can:

- Track sobriety streaks with visual calendar
- Check off sober days and celebrate milestones
- View mental health trends over time (anxiety, stress, depression patterns)
- Earn **"Campus Bucks"** or similar incentives when reaching sobriety goals

**Challenges to solve**: 
- Honor system integrity: How to incentivize honesty while preventing abuse
- Potential solution: Combine self-reporting with optional accountability partners or periodic video check-ins
- Balance incentives with genuine wellness focus

**Impact**: Gamification and progress visualization increase motivation and long-term engagement.

### 3. Peer Support Forum

A **student-focused forum** modeled after Reddit where users can:

- Share experiences and coping strategies anonymously
- Discuss mental health challenges in a safe, moderated space
- Offer and receive peer support from others who understand
- Upvote helpful advice and resources

**Moderation approach**:
- AI-powered content filtering for harmful content
- Community moderators trained in mental health support
- Crisis detection system that flags concerning posts for intervention

**Impact**: Reduces isolation by creating a supportive community, normalizing mental health conversations, and providing peer-to-peer support that complements professional resources.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

