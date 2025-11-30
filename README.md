# TeyvatVN Frontend

This is the React-based frontend for the TeyvatVN application, built with Vite. It provides the user interface for playing visual novels, creating stories, and managing the library.

## Getting Started

### Prerequisites
- Node.js (v14+ recommended)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure you have a `.env` file in the root directory with:
   - `VITE_API_BASE_URL` (defaults to http://localhost:8000)

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:6001` (or the next available port).

## File Structure

The frontend code is organized in the `src/` directory:

```
src/
├── components/          # React Components
│   ├── auth/            # Authentication components
│   │   └── ProtectedRoute.jsx  # Route guard
│   ├── common/          # Shared/Generic components
│   │   └── ScrollToTop.jsx
│   ├── layout/          # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx   # Main page wrapper
│   └── vn/              # Visual Novel specific components
│       ├── VNScene.jsx         # Main VN display engine
│       ├── VNTextBox.jsx       # Dialogue box
│       ├── BackgroundSelector.jsx
│       └── SegmentNavigator.jsx
├── context/             # React Contexts
│   ├── AuthContext.jsx      # User auth state
│   └── CharacterContext.jsx # Character selection state
├── pages/               # Application Pages
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── StoryPage.jsx    # Story creation/input
│   ├── EditorPage.jsx   # Story editing
│   ├── PlayPage.jsx     # Story playback
│   ├── LibraryPage.jsx
│   └── ...
├── services/            # API Services
│   └── api.js           # Axios instance configuration
├── hooks/               # Custom React Hooks
├── utils/               # Utility functions
├── assets/              # Static assets (images, fonts)
├── App.jsx              # Main App component & Routing
└── main.jsx             # Entry point
```

## Key Features
- **Visual Novel Engine**: `VNScene` component renders the story with backgrounds, characters, and dialogue.
- **Authentication**: `AuthContext` manages user state and integrates with the backend JWT auth.
- **Story Creation**: `StoryPage` allows users to input prompts and generate stories via the backend AI service.
- **Editor**: `EditorPage` provides a live preview for editing generated stories.