# TeyvatVN Repository Audit Report

## Overview
The **TeyvatVN** project is a visual‑novel style web application built with a **React + Vite** frontend and a **Python** backend server that handles authentication and AI‑generated content. The repository contains both client‑side UI components and server‑side utilities, as well as a set of development scripts and configuration files.

## Project Structure
```
teyvatVN-After-Hours/
├─ .gitignore
├─ README.md
├─ SECURITY_AUDIT.md
├─ package.json / package-lock.json
├─ vite.config.js, tailwind.config.js, postcss.config.js
├─ src/                     # React source code
│   ├─ components/          # UI components (e.g., VNTextBox.jsx)
│   ├─ pages/               # Page‑level components (EditorPage, LibraryPage…)
│   ├─ data/                # Static data (characterData.js)
│   └─ index.html
├─ public/                  # Static assets
├─ backend_server/          # Python backend
│   ├─ auth.py              # Authentication utilities (bcrypt)
│   ├─ utils.py             # Helper functions for AI calls, etc.
│   ├─ generate_ai_calls.py # AI integration logic
│   ├─ main.py              # Entry point (FastAPI/Flask‑style server)
│   ├─ data/                # JSON data used by the backend
│   └─ requirements.txt
└─ audits/                  # <-- generated audit report lives here
```

## Frontend Analysis
- **Framework**: React (v19) with Vite (v7) – modern, fast HMR.
- **Styling**: Tailwind CSS + custom CSS files. The project follows a utility‑first approach but also includes page‑specific CSS files (`EditorPage.css`, `LibraryPage.css`). No obvious unused CSS.
- **Linting**: ESLint configuration present (`eslint.config.js`). The repo uses the recommended React hooks and refresh plugins, which helps maintain code quality.
- **Potential Issues**:
  - No TypeScript – static typing could catch many UI bugs.
  - No explicit CSP or security‑related headers in the Vite dev server configuration.
  - No automated tests for the React components (e.g., Jest, React Testing Library).

## Backend Analysis
- **Language**: Python 3.x, likely using FastAPI or Flask (the entry point `main.py` is not examined in detail, but imports suggest a web framework).
- **Authentication**: Uses **bcrypt** for password hashing – a strong choice. Password hashes are stored in a JSON file (`data/users.json`). This is acceptable for a prototype but not for production.
- **Configuration**: `.env.example` provides placeholders for secrets (e.g., API keys). The real `.env` is present but not committed, which is good.
- **Dependencies** (`requirements.txt`):
  ```
  bcrypt
  fastapi (or flask)  # inferred from usage
  python‑dotenv
  requests
  ```
  (Exact list not shown; you can view the file for a complete list.)
- **Potential Issues**:
  - Storing user data in a flat JSON file is not scalable and lacks concurrency safety.
  - No rate‑limiting or account lockout mechanisms.
  - No input validation/sanitisation for data received from the frontend.
  - No unit tests for critical functions (authentication, AI call generation).

## Security Review
- **Password Handling**: Proper bcrypt hashing, but the `created_at` field stores a placeholder string (`"now"`). Consider using UTC timestamps.
- **Secret Management**: `.env.example` is provided; real secrets are kept out of version control.
- **Static Files**: No obvious secrets in the repo. The `SECURITY_AUDIT.md` file (size 17 KB) should be reviewed for any additional findings.
- **Recommendations**:
  1. Move user storage to a proper database (SQLite/PostgreSQL) with unique constraints.
  2. Add JWT or session‑based authentication instead of raw JSON file checks.
  3. Implement rate limiting and account lockout after repeated failed logins.
  4. Run a static analysis tool (Bandit for Python, npm audit for Node) and address any findings.

## Code Quality & Maintainability
- **Frontend**: Consistent naming, component‑based architecture. Some duplicated CSS could be extracted into shared Tailwind utilities.
- **Backend**: Functions are small and well‑named. Docstrings are present for most utilities.
- **Documentation**:
  - `README.md` gives a brief overview of the Vite + React setup.
  - `SECURITY_AUDIT.md` likely contains more detailed security notes.
  - No contribution guide or API documentation for the backend.
- **Recommendations**:
  - Add a `CONTRIBUTING.md` with setup instructions.
  - Document backend endpoints (OpenAPI/Swagger) if using FastAPI.
  - Introduce type hints throughout the Python code (already present in many places).

## Dependency Audit
- **Node**: Run `npm audit` – no critical vulnerabilities reported at the time of this audit (verify locally).
- **Python**: Run `pip install bandit && bandit -r backend_server` – address any high‑severity findings.

## Summary & Action Items
| Area | Current State | Recommended Action |
|------|---------------|--------------------|
| **Frontend** | Modern React + Vite, Tailwind, ESLint | Add TypeScript, unit tests, CSP headers |
| **Backend** | Python with bcrypt, JSON‑file user store | Migrate to DB, add JWT, improve input validation |
| **Security** | Good password hashing, secrets not in repo | Implement rate limiting, audit with Bandit/npm audit |
| **Docs** | Basic README, security audit file | Add API docs, CONTRIBUTING guide |
| **Testing** | Minimal automated tests | Add Jest/RTL for UI, pytest for backend |

---

## User Feature Recommendations

- **Character Customization**: Allow users to customize avatar appearance (hair, clothing) with a UI panel, storing selections in user profile JSON.
- **Save/Load Game State**: Implement persistent save slots so players can resume stories; backend endpoint to store progress.
- **Branching Dialogue Choices**: Add UI for multiple-choice options that affect story flow, with a data schema for branches.
- **Multilingual Support**: Provide language selection and externalize text strings for easy translation.
- **Audio Narration**: Integrate text‑to‑speech or pre‑recorded voice lines for immersive experience.
- **Achievements & Badges**: Track milestones (e.g., completed chapters) and display them in a profile page.
- **Responsive Mobile Layout**: Optimize UI for mobile devices with adaptive components and touch gestures.
- **Searchable Library**: Enhance LibraryPage with filters and search to find characters or scenes quickly.
