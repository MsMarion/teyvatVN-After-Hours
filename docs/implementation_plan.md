# Implementation Plan - TeyvatVN Improvements

# Goal Description
The goal is to finalize the integration between the React frontend and the FastAPI backend, ensuring that users can generate and view stories seamlessly. Currently, the connection is partial: the frontend sends a request, but the backend's response handling and data persistence need work, and the frontend doesn't display the result.

## User Review Required
> [!IMPORTANT]
> **API Key Management**: The current implementation relies on hardcoded project IDs in Python and `import.meta.env` in JS. For this iteration, we will keep them as is but note that they should be secured in a future production release.

## Proposed Changes

### Backend (`teyvatVN/backend_server`)

#### [MODIFY] [main.py](file:///c:/Users/Dawn/Desktop/Projects/Antigravity/teyvatVN-After-Hours/teyvatVN/backend_server/main.py)
- Update `save_chapter` endpoint to:
    - Properly call `generate_ai_calls.generate_beats`.
    - Ensure the output is saved to `output.json` in the correct directory.
    - Return the full generated story content (or a clear path/ID for the frontend to fetch immediately).
- Remove excessive print statements.

#### [MODIFY] [generate_ai_calls.py](file:///c:/Users/Dawn/Desktop/Projects/Antigravity/teyvatVN-After-Hours/teyvatVN/backend_server/generate_ai_calls.py)
- Verify that `generate_beats` returns a JSON structure compatible with the frontend's rendering logic (segments, dialogue, etc.).
- Ensure error handling if the AI fails to generate valid JSON.

### Frontend (`teyvatVN/src`)

#### [MODIFY] [StoryPage.jsx](file:///c:/Users/Dawn/Desktop/Projects/Antigravity/teyvatVN-After-Hours/teyvatVN/src/pages/StoryPage.jsx)
- Update `handleGenerate` to:
    - Set `isLoading` to true.
    - Call the backend API.
    - Handle the response (parse the returned JSON).
    - Update `generatedStory` state with the result.
    - Handle errors (show alert or error message).
- Ensure the rendering logic matches the backend's output format.

## Verification Plan

### Automated Tests
- None currently exist. We will rely on manual verification.

### Manual Verification
1.  **Start Backend**: Run `uvicorn main:app --reload --port 4000` in `backend_server`.
2.  **Start Frontend**: Run `npm run dev` in `teyvatVN`.
3.  **Generate Story**:
    - Go to `http://localhost:5173`.
    - Select characters (e.g., Diluc, Kaeya).
    - Go to Story Page.
    - Select a background.
    - Enter a prompt (e.g., "They argue about wine.").
    - Click "Generate".
4.  **Verify**:
    - Check that "Generating..." appears.
    - Wait for completion.
    - Verify that the story text/dialogue appears on the screen.
    - Verify that `output.json` is created in `backend_server/data/dawn/chapter1/`.
