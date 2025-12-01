# TeyvatVN Backend Server

This is the FastAPI backend for the TeyvatVN application. It handles user authentication, story generation (via Gemini API), and library management.

## Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure you have a `.env` file in this directory (`backend/.env`) with the necessary environment variables:
   - `GEMINI_API_KEY`
   - `DATABASE_URL` (if using a specific DB, defaults to SQLite)
   - `SECRET_KEY`
   - `ENCRYPTION_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL`
   - `BACKEND_URL`

### Running the Server

To start the development server with hot reload enabled, run:

```bash
python -m uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`.

## File Structure

The backend has been refactored into a modular `app` package structure:

```
backend/
├── app/
│   ├── main.py              # Application entry point. Configures FastAPI, CORS, and includes routers.
│   ├── core/                # Core configuration and security logic.
│   │   ├── config.py        # Environment variable loading.
│   │   ├── database.py      # Database connection and session handling.
│   │   ├── security.py      # Encryption utilities.
│   │   ├── jwt_utils.py     # JWT token generation and verification.
│   │   └── google_auth.py   # Google OAuth2 integration.
│   ├── models/              # Database models.
│   │   └── sql.py           # SQLAlchemy models (User, etc.).
│   ├── routers/             # API Route definitions.
│   │   ├── auth.py          # Authentication endpoints (Login, Register).
│   │   ├── story.py         # Story and Library management endpoints.
│   │   └── ai.py            # AI Story generation endpoints.
│   ├── services/            # Business logic layer.
│   │   ├── auth_service.py  # User management logic.
│   │   └── ai_service.py    # Interaction with Gemini API.
│   └── common/              # Shared utilities.
│       └── utils.py         # General helper functions.
├── scripts/                 # Utility and verification scripts.
├── tests/                   # Automated tests.
├── data/                    # Local storage for generated stories.
└── requirements.txt         # Python dependencies.
```

## Key Features
- **Modular Design**: Separated concerns into Routers, Services, and Core logic.
- **Security**: Uses JWT for auth, bcrypt for password hashing, and Fernet for API key encryption.
- **AI Integration**: specialized service for communicating with Google Gemini.
