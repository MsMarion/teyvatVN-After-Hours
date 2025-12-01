# Configuring Hosts and Ports

This guide explains how to configure the network settings (Host and Port) for both the Frontend and Backend applications.

## Frontend (Vite)

The frontend configuration is located in `frontend/vite.config.js`. We have updated it to read from environment variables.

### How to Change
You can change the port and host by setting environment variables in your `frontend/.env` file.

**1. Open/Create `frontend/.env`**
```properties
# ... existing variables ...
VITE_API_BASE_URL=http://localhost:8000

# Network Settings
PORT=6001
HOST=localhost
```

**2. Restart the Server**
Stop the running server (Ctrl+C) and run:
```bash
npm run dev
```

### Alternative: Command Line
You can also pass these variables directly when running the command:
```bash
# Windows (PowerShell)
$env:PORT=3000; npm run dev
```

## Backend (FastAPI)

The backend configuration depends on how you run the server.

### Method 1: Running via Python Script (`python app/main.py`)
We have updated `backend/app/main.py` to read from environment variables.

**1. Open/Create `backend/.env`**
```properties
# ... existing variables ...

# Network Settings
PORT=8000
HOST=127.0.0.1
```

**2. Run the Server**
```bash
python -m app.main
```

### Method 2: Running via Uvicorn CLI (Standard)
If you run the server using the `uvicorn` command directly (common in production or standard dev workflows), you pass the host and port as flags.

```bash
# Example: Run on port 8080
uvicorn app.main:app --reload --port 8080 --host 0.0.0.0
```

## Important Note on Connections
If you change the **Backend Port** (e.g., to 8080), you **MUST** also update the **Frontend** to know about this change.

1.  Open `frontend/.env`
2.  Update `VITE_API_BASE_URL` to match the new backend URL:
    ```properties
    VITE_API_BASE_URL=http://localhost:8080
    ```
