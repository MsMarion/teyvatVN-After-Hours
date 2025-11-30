# Authentication System Improvement Audit

## Current State Analysis
- **Token Storage:** `localStorage` (Vulnerable to XSS).
- **Session Management:** Single Access Token (No refresh mechanism, requires frequent logins or long-lived dangerous tokens).
- **Database:** SQLite (Not suitable for production concurrency).
- **Security:**
    - CORS allows all origins (`*`).
    - No Rate Limiting (Vulnerable to brute force).
    - No Email Verification for standard signups.

## Recommended Improvements

### 1. Token Storage & Session Management (High Priority)
**Current:** JWT stored in `localStorage`.
**Problem:** If an attacker succeeds in an XSS attack (injecting script), they can steal the token and impersonate the user.
**Recommendation:**
- **Move to HttpOnly Cookies:** Store the Access Token (and Refresh Token) in `HttpOnly`, `Secure`, `SameSite` cookies. JavaScript cannot read these, mitigating XSS token theft.
- **Implement Refresh Tokens:** Short-lived Access Tokens (e.g., 15 mins) + Long-lived Refresh Tokens (e.g., 7 days). This allows revoking sessions without waiting for the access token to expire.

### 2. Security Hardening (Medium Priority)
**Current:** Basic implementation.
**Recommendation:**
- **Restrict CORS:** Only allow specific frontend domains (e.g., `http://localhost:6001`, production domain).
- **Rate Limiting:** Implement `slowapi` or similar to limit login/register attempts (e.g., 5 attempts per minute) to prevent brute force.
- **Helmet/Headers:** Add security headers (Content-Security-Policy, X-Frame-Options) to the backend responses.

### 3. User Lifecycle Features (Standard Practice)
**Current:** Basic Register/Login.
**Recommendation:**
- **Email Verification:** Send a code/link to the email to verify ownership before allowing login.
- **Password Reset:** "Forgot Password" flow sending a reset link to email.
- **Account Locking:** Temporarily lock account after N failed attempts.

### 4. Infrastructure (Production Readiness)
**Current:** SQLite.
**Recommendation:**
- **Migrate to PostgreSQL:** Better concurrency, reliability, and data types for production workloads.
- **Environment Config:** Ensure strict validation of all ENV variables (using Pydantic `BaseSettings`).

## Proposed Roadmap Options

### Option A: The "Secure Core" (Recommended First Step)
Focus on fixing the most critical security vulnerabilities.
1.  Migrate JWT storage to **HttpOnly Cookies**.
2.  Implement **Refresh Token** rotation.
3.  Restrict **CORS**.

### Option B: The "Feature Complete"
Focus on user experience and standard flows.
1.  Implement **Email Verification**.
2.  Implement **Password Reset**.
3.  Add **Rate Limiting**.

### Option C: The "Production Lift"
Focus on scalability and infrastructure.
1.  Migrate DB to **PostgreSQL**.
2.  Dockerize the application.
3.  Set up CI/CD pipelines.
