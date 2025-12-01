# Implementation Plan: Hardcoded Values Remediation

**Objective:** Externalize hardcoded configuration values to environment variables to improve security and flexibility.

## Phase 1: Frontend Remediation

### 1.1 Environment Configuration
- **Action:** Create `frontend/.env` (if it doesn't exist) and `frontend/.env.example`.
- **Variables:**
  - `VITE_API_BASE_URL=http://localhost:8000`

### 1.2 Code Refactoring
- **File:** `frontend/src/config/api.js`
  - **Change:** Replace hardcoded URL with `import.meta.env.VITE_API_BASE_URL`.
  - **Fallback:** Keep `http://localhost:8000` as a fallback or fail loudly if missing (fallback is safer for dev).

- **File:** `frontend/vite.config.js`
  - **Change:** Allow port to be overridden by `process.env.PORT` or `VITE_PORT` (Optional, but good practice).

## Phase 2: Backend Remediation

### 2.1 Environment Configuration
- **Action:** Update `backend/.env` and `backend/.env.example`.
- **Variables:**
  - `DATABASE_URL=sqlite:///./sql_app.db`
  - `ALLOWED_ORIGINS=http://localhost:6001,https://updates-limitations-favors-effectively.trycloudflare.com`
  - `GEMINI_MODEL_NAME=gemini-2.5-flash`

### 2.2 Code Refactoring
- **File:** `backend/app/core/database.py`
  - **Change:** Initialize `SQLALCHEMY_DATABASE_URL` from `os.getenv("DATABASE_URL")`.

- **File:** `backend/app/main.py`
  - **Change:** Parse `ALLOWED_ORIGINS` from env var (comma-separated string) into a list for `CORSMiddleware`.

- **File:** `backend/app/services/ai_service.py`
  - **Change:** Replace hardcoded model strings (e.g., "gemini-2.5-flash-lite") with `os.getenv("GEMINI_MODEL_NAME")`.

- **File:** `backend/app/routers/auth.py`
  - **Change:** Ensure `FRONTEND_URL` is consistent with `main.py` or imported from a central config to avoid duplication.

## Phase 3: Verification

### 3.1 Frontend Verification
- **Test:** Start frontend (`npm run dev`).
- **Check:** Verify it connects to the backend (e.g., login or load story) without errors.

### 3.2 Backend Verification
- **Test:** Start backend (`uvicorn app.main:app --reload`).
- **Check:**
  - Database connects successfully.
  - CORS allows requests from frontend.
  - AI generation works (uses the correct model from env).
