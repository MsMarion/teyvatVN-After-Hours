# TeyvatVN Integration Walkthrough

I have completed the integration between the React frontend and the FastAPI backend. The system can now generate full stories using Google Vertex AI and display them to the user.

## Changes Overview

### Backend
- **`backend_server/generate_ai_calls.py`**:
    - Refactored to include a `generate_story` function that orchestrates the entire process.
    - Implemented `generate_beats` to create a scene outline.
    - Implemented `generate_beat_details` to expand each beat into a full narrative segment.
    - Added robust JSON parsing and error handling.
- **`backend_server/main.py`**:
    - Updated the `POST /api/{username}/{chapter_id}` endpoint.
    - It now calls `generate_story` and returns the full story structure (segments, characters, etc.) in the JSON response.
    - Fixed file saving logic to ensure `output.json` is stored correctly.

### Frontend
- **`src/pages/StoryPage.jsx`**:
    - Updated `handleGenerate` to call the real backend API.
    - Added loading state (`Generating story...`).
    - Parses the returned JSON and displays the generated story segments in the UI.

## How to Verify

1.  **Start the Backend**:
    ```bash
    cd backend_server
    uvicorn main:app --reload --port 4000
    ```

2.  **Start the Frontend**:
    ```bash
    cd teyvatVN
    npm run dev
    ```

3.  **Generate a Story**:
    - Open your browser to `http://localhost:5173`.
    - Click "Start" or navigate to the Characters page.
    - Select two characters (e.g., Diluc and Kaeya).
    - Click "Next" to go to the Story page.
    - Select a background (e.g., "Angel's Share").
    - Enter a prompt (e.g., "Diluc refuses to serve Kaeya another drink.").
    - Click the **Arrow Button** (Generate).

4.  **Expected Result**:
    - The button should disable, and a "Generating..." message should appear.
    - After a few seconds (depending on AI speed), the generated story text should appear in the black box below.
    - You can also check `backend_server/data/dawn/chapter1/output.json` to see the saved file.
