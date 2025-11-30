# TeyvatVN System Documentation

## 1. System Overview

TeyvatVN is a web-based Visual Novel generator set in the Genshin Impact universe. It allows users to select characters and backgrounds, provide a prompt, and generate a dynamic visual novel scene using AI.

The system is built using a **Client-Server architecture**:
- **Frontend**: A React application (Vite) that handles user interaction, character selection, and story display.
- **Backend**: A FastAPI (Python) server that interfaces with Google Vertex AI to generate narrative content.

> [!NOTE]
> Currently, the integration between Frontend and Backend appears to be in a transitional state, with some frontend components using mock data or direct API calls, while the backend has fully functional generation logic.

---

## 2. Frontend Architecture

**Location**: `teyvatVN/src`

### Tech Stack
- **Framework**: React 19 (via Vite)
- **Routing**: React Router Dom v7
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **Animations**: AOS (Animate On Scroll)

### Key Components & Pages
- **`LandingPage.jsx`**: The entry point of the application.
- **`CharacterPage.jsx`**: Allows users to select characters (e.g., Diluc, Kaeya) for the story.
- **`PromptInputPage.jsx`**: A page for users to input their story prompt. Currently uses mock data for demonstration.
- **`StoryPage.jsx`**: The main display for the generated visual novel. It handles background selection and *intended* story generation triggers.
- **`api/generateStory.js`**: A utility for calling the Google Gemini API directly from the client (Client-side generation).

### Data Flow (Frontend)
1.  User lands on `LandingPage`.
2.  Navigates to `CharacterPage` to select characters (stored in `CharacterContext` and `localStorage`).
3.  Proceeds to `StoryPage`.
4.  Inputs a prompt.
5.  **Current Flow**:
    - `handleGenerate` sends a POST request to `http://localhost:4000/api/dawn/chapter1` with `prompt`, `char1`, `char2`, and `background`.
    - The backend triggers AI generation.
    - *Missing*: Frontend does not yet handle the response or fetch the generated story to display it.

---

## 3. Backend Architecture

**Location**: `teyvatVN/backend_server`

### Tech Stack
- **Framework**: FastAPI
- **Language**: Python 3.x
- **AI Provider**: Google Vertex AI (Gemini Models)
- **Server**: Uvicorn

### Key Files
- **`main.py`**: The application entry point.
    - Configures CORS to allow requests from the frontend.
    - Defines endpoints for saving and retrieving chapters.
    - **`POST /api/{username}/{chapter_id}`**: Accepts `prompt`, `char1`, `char2`, `background`. Calls `generate_ai_calls.generate_beats` to generate the story. Currently saves to `output.json` (work in progress).
- **`generate_ai_calls.py`**: Contains the logic for interacting with Vertex AI.
    - **`generate_beats`**: Generates a high-level outline of the scene (beats).
    - **`generate_beat_details`**: Expands each beat into detailed narrative segments using `gemini-2.5-flash-001`.

### Data Storage
- **Local JSON**: Generated stories are saved as `output.json` in `backend_server/data/{username}/{chapter_id}/`.

---

## 4. AI Integration Details

The system uses a two-step generation process to ensure high-quality narratives:

1.  **Beat Generation**:
    - The system first asks the AI to act as a "playwright" and outline the scene in "beats" (key events).
    - This ensures the story has a logical structure (beginning, middle, end).

2.  **Detail Expansion**:
    - Each beat is then passed to the AI again (acting as a "descriptive novelist").
    - The AI fleshes out the sensory details, actions, and internal feelings for that specific beat, ensuring a rich narrative experience.

---

## 5. Current Limitations & Next Steps

- **Integration Gap**: The frontend sends the request but doesn't display the result. The backend generates data but needs to ensure it returns the correct JSON structure for the frontend to render.
- **Hardcoded Values**: Username and Chapter ID are hardcoded to `dawn/chapter1` in some places.
- **Environment Variables**: API keys and URLs should be externalized.

