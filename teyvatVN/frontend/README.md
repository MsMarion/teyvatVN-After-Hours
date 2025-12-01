# TeyvatVN Frontend

This is the React-based frontend for the TeyvatVN application. It provides a rich, interactive Visual Novel experience, allowing users to generate, edit, and play stories set in the world of Teyvat.

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in this directory with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Running the App

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:6001` (or similar).

## Project Structure

The project is organized to separate UI components, pages, and logic.

```
frontend/src/
├── components/          # Reusable UI building blocks
│   ├── layout/          # Structural components (Header, Footer, Layout)
│   ├── vn/              # Visual Novel specific components
│   │   ├── VNScene.jsx      # The core engine that renders the VN
│   │   ├── VNTextBox.jsx    # The dialogue box
│   │   └── ...
│   └── common/          # Generic UI elements (Buttons, Inputs)
├── pages/               # Main application screens
│   ├── LandingPage.jsx  # Home page
│   ├── LoginPage.jsx    # User authentication
│   ├── PlayPage.jsx     # The "Player" view for stories
│   ├── EditorPage.jsx   # The "Creator" view for stories
│   └── ...
├── context/             # Global State Management
│   ├── AuthContext.jsx  # Handles user login/logout state
│   └── CharacterContext.jsx # Manages character data
├── api/                 # Backend communication
│   ├── axios.js         # Configured Axios instance
│   └── ...
├── config/              # Static configuration
│   ├── backgrounds.js   # List of available backgrounds
│   └── ...
└── App.jsx              # Main Router setup
```

## Key Concepts

### The VN Engine (`VNScene.jsx`)
This is the heart of the application. It takes a "Story Segment" (a piece of dialogue, a background, and characters) and renders it. It handles:
- **Backgrounds**: Smooth transitions between scenes.
- **Characters**: Positioning and displaying character sprites.
- **Dialogue**: Typing effects and navigation.

### Story Structure
A **Story** is composed of **Chapters**.
A **Chapter** is composed of **Segments**.
- **Segment**: A single "screen" of the visual novel (e.g., Paimon saying "Hello!").

### Authentication
We use **JWT (JSON Web Tokens)**.
- When you log in, the backend gives you a token.
- `AuthContext` saves this token.
- `axios.js` automatically adds this token to every request you make to the backend.

## Deep Dive Documentation
We have added detailed, beginner-friendly comments to almost every major file in this codebase. If you want to understand how a specific component works, just open the file!
