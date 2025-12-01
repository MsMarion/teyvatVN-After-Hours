# Hardcoded Values Audit

**Date:** 2025-11-30
**Scope:** Frontend and Backend Codebase

## Overview
This audit identifies hardcoded configuration values, secrets, and environment-specific settings that should be externalized to environment variables (`.env`). Moving these values increases security, configurability, and portability of the application.

## Frontend Findings

### 1. API Configuration
- **File:** `frontend/src/config/api.js`
- **Code:** `export const API_BASE_URL = "http://localhost:8000";`
- **Issue:** The backend URL is hardcoded. This will cause issues when deploying to production or if the backend runs on a different port/host.
- **Recommendation:** Replace with `import.meta.env.VITE_API_BASE_URL` and provide a fallback.

### 2. Vite Configuration
- **File:** `frontend/vite.config.js`
- **Code:** `port: 6001`
- **Issue:** The development server port is hardcoded.
- **Recommendation:** Consider using an environment variable like `PORT` or `VITE_PORT` if flexibility is required.

## Backend Findings

### 1. Database Configuration
- **File:** `backend/app/core/database.py`
- **Code:** `SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"`
- **Issue:** The database connection string is hardcoded. This prevents easily switching to a production database (like PostgreSQL) or changing the file location.
- **Recommendation:** Use a `DATABASE_URL` environment variable.

### 2. CORS and URL Configuration
- **File:** `backend/app/main.py`
- **Code:**
  - `FRONTEND_URL` default: `"http://localhost:6001"`
  - `BACKEND_URL` default: `"http://localhost:6002"`
  - CORS `allow_origins`: Includes specific Cloudflare URL `"https://updates-limitations-favors-effectively.trycloudflare.com"`
- **Issue:** Hardcoded defaults and specific tunnel URLs in the CORS policy make the app brittle and hard to deploy to new environments.
- **Recommendation:**
  - Load `FRONTEND_URL` and `BACKEND_URL` strictly from env vars or a central config.
  - Load `ALLOWED_ORIGINS` as a comma-separated list from an environment variable to allow dynamic configuration of CORS.

### 3. AI Service Configuration
- **File:** `backend/app/services/ai_service.py`
- **Code:**
  - `model = genai.GenerativeModel("gemini-2.5-flash-lite")`
  - `model = genai.GenerativeModel("gemini-2.5-flash", ...)`
- **Issue:** AI model versions are hardcoded. Upgrading to a newer model requires code changes in multiple places.
- **Recommendation:** Use a `GEMINI_MODEL_NAME` environment variable.

### 4. Auth Router Configuration
- **File:** `backend/app/routers/auth.py`
- **Code:** `FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:6001")`
- **Issue:** Redundant definition of the default `FRONTEND_URL`. If the default changes, it must be updated here and in `main.py`.
- **Recommendation:** Centralize configuration in a `app/core/config.py` file.

## Verification Against Existing Configuration

I have compared these findings against the existing `backend/.env.example` file.

### Backend (`backend/.env.example`)
- **Present:** `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SECRET_KEY`, `GEMINI_API_KEY`.
- **Missing:**
  - `DATABASE_URL`: The database path is currently hardcoded in `database.py` and not present in the example configuration.
  - `ALLOWED_ORIGINS`: CORS origins are hardcoded in `main.py`.
  - `GEMINI_MODEL_NAME`: Model versions are hardcoded in `ai_service.py`.

### Frontend
- **Missing:** No `.env.example` file was found in the `frontend` directory.

## Action Plan

### 1. Create/Update `.env` Files

**Frontend (`frontend/.env`):**
*Create a new `.env` file (and `.env.example`) with:*
```properties
VITE_API_BASE_URL=http://localhost:8000
```

**Backend (`backend/.env`):**
*Add the following to your existing `.env`:*
```properties
# Database
DATABASE_URL=sqlite:///./sql_app.db

# Security
ALLOWED_ORIGINS=http://localhost:6001,https://your-tunnel-url.trycloudflare.com

# AI Configuration
GEMINI_MODEL_NAME=gemini-2.5-flash
```

### 2. Refactor Code
- **Frontend:** Update `frontend/src/config/api.js` to use `import.meta.env`.
- **Backend:**
  - Update `backend/app/core/database.py` to use `os.getenv("DATABASE_URL")`.
  - Update `backend/app/main.py` to parse `ALLOWED_ORIGINS`.
  - Update `backend/app/services/ai_service.py` to use `os.getenv("GEMINI_MODEL_NAME")`.
  - **Cleanup:** Remove the redundant `FRONTEND_URL` definition in `backend/app/routers/auth.py` and import it from a central config or `main.py` (or just use `os.getenv` again without the default if we enforce the env var).
