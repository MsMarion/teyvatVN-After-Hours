# TeyvatVN System Documentation

This document outlines the key systems in the TeyvatVN project and how to use them.

## 1. Visual Novel Engine (`VNScene`)

The core of the visual novel experience is the `VNScene` component. It encapsulates the background, character sprites, and the text box overlay.

### Location
`src/components/VNScene.jsx`

### Usage Modes

`VNScene` operates in two distinct modes:

#### A. Playback Mode (Reader)
Used in `StoryPage` and `PlayPage`. It takes a full `story` object and handles navigation internally.

**Props:**
- `story`: The complete story object (JSON) containing `segments`, `characters`, etc.
- `backgroundImage`: URL of the background image.
- `isFullscreen`: Boolean to toggle fullscreen styling.
- `onToggleFullscreen`: Callback to enter fullscreen.
- `onExitFullscreen`: Callback to exit fullscreen.

**Example:**
```jsx
<VNScene 
    story={generatedStory}
    backgroundImage={bgSrc}
    isFullscreen={isFullscreen}
    onToggleFullscreen={handleToggle}
    onExitFullscreen={handleExit}
/>
```

#### B. Controlled Mode (Editor)
Used in `EditorPage`. It renders a specific state based on props, allowing for live previews of edits.

**Props:**
- `characters`: Array of character names to display.
- `currentSegment`: The specific segment object to render (dialogue or narration).
- `currentIndex`: Current segment index (for progress display).
- `totalSegments`: Total number of segments.
- `onNext` / `onPrev`: Callbacks for navigation buttons (optional).
- `backgroundImage`: URL of the background image.

**Example:**
```jsx
<VNScene
    characters={['Amber', 'Kaeya']}
    currentSegment={editingSegment}
    currentIndex={0}
    totalSegments={10}
    backgroundImage={bgSrc}
/>
```

---

## 2. Story Generation System

The story generation flow connects the frontend to the AI backend.

### Workflow
1.  **User Input**: User selects characters and enters a prompt on `StoryPage`.
2.  **API Request**: Frontend sends `POST` request to `/api/generate_story` (or similar endpoint defined in `API_URL`).
3.  **AI Processing**: Backend (FastAPI) constructs a prompt for the LLM, requesting a JSON response.
4.  **Response**: The backend returns a structured JSON object representing the "Chapter".
5.  **Rendering**: The frontend receives the JSON and passes it to `VNScene` for playback.

### Data Structure (Chapter)
```json
{
  "title": "Story Title",
  "backgrounds": ["favonius_cathedral"],
  "characters": ["Amber", "Eula"],
  "segments": [
    {
      "type": "narration",
      "text": "The sun was setting..."
    },
    {
      "type": "dialogue",
      "speaker": "Amber",
      "line": "Let's go gliding!",
      "expression_action": "smiling"
    }
  ]
}
```

---

## 3. Character System

Characters are managed via a static database and a React Context.

### Data Source
`src/data/characterData.js`

This file exports `characterDatabase`, mapping character IDs/Names to their metadata and sprite assets.

**Adding a New Character:**
1.  Add an entry to `characterDatabase`.
2.  Import the sprite image.
3.  Define `storySprites` (currently uses a default sprite).

```javascript
export const characterDatabase = {
    "Amber": {
        id: "amber",
        name: "Amber",
        storySprites: { default: amberSprite }
    },
    // ...
};
```

### Context
`src/context/CharacterContext.jsx`

- Manages `selectedCharacters` state (the duo selected by the user).
- Persists selection to `localStorage`.

---

## 4. Backend Architecture

The backend is a FastAPI application serving the API endpoints.

### Location
`backend/app/main.py`

### Key Configuration
- **Port**: Defaults to `8000`.
- **Database**: SQLite (`sql_app.db`).

### Key Endpoints
- `GET /api/chapter/{username}/{chapter_id}`: Fetch a specific story chapter.
- `POST /api/generate`: Generate a new story (proxies to LLM).
- `PUT /api/chapter/{username}/{chapter_id}/segments`: Update segments (used by Editor).

---

## 5. Authentication

Authentication is handled via a custom token-based system (migrating to more secure methods).

### Components
- `AuthContext.jsx`: Manages `user` state and `authToken`.
- `ProtectedRoute.jsx`: Wrapper component to restrict access to authenticated routes.

### Flow
1.  User logs in via `/login`.
2.  Backend verifies credentials and returns a token.
3.  Frontend stores token in `localStorage`.
4.  `ProtectedRoute` checks for token presence before rendering protected pages (`/story`, `/play`, `/editor`).

---

## 6. Future Improvements / TODO

- [ ] **API Key Guide**: Create a "How to get your Gemini API Key" guide for users to help them set up their account.
- [ ] **Rate Limiting**: Implement a rate limit or quota system for the free tier to prevent spam and abuse of the system API key (if enabled) or server resources.

