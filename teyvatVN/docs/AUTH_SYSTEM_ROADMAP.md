# Authentication System Development Roadmap

This document outlines the planned enhancements and future considerations for the authentication system, building upon the initial SQLite database and Google OAuth2 integration.

## I. Core Authentication System Enhancements

These are the immediate next steps to build out the robust authentication system as per the `robust_auth_plan.md`.

1.  **Implement JWT Generation and Verification:**
    *   **Objective:** Replace placeholder tokens with secure JSON Web Tokens (JWTs) for authentication.
    *   **Details:**
        *   Generate `access_token` (short-lived) and `refresh_token` (long-lived) upon successful login (both traditional username/password and Google OAuth2).
        *   Define a `SECRET_KEY` (loaded from `.env`) for signing JWTs.
        *   Implement functions to encode and decode JWTs.
        *   Create a FastAPI `Depends` function (`get_current_user`) to decode and verify JWTs from incoming requests, extracting the authenticated user's information.

2.  **Refresh Token Rotation Logic:**
    *   **Objective:** Provide a secure mechanism for users to obtain new access tokens without re-entering credentials.
    *   **Details:**
        *   Implement an endpoint to exchange a valid `refresh_token` for a new `access_token` and a new `refresh_token`.
        *   Store refresh tokens securely in the database, associated with a user and a unique identifier.
        *   Implement refresh token rotation: when a new access token is issued, the old refresh token should be invalidated, and a new one issued. This enhances security by limiting the lifespan of any single refresh token.
        *   Ensure refresh tokens are sent as HTTP-only cookies to mitigate Cross-Site Scripting (XSS) attacks.

3.  **Rate Limiting Middleware:**
    *   **Objective:** Protect authentication endpoints from brute-force attacks.
    *   **Details:**
        *   Integrate a rate-limiting library (e.g., `slowapi`) into the FastAPI application.
        *   Apply rate limits to critical endpoints such as `/api/auth/login`, `/api/auth/register`, and `/api/auth/google/login` to prevent excessive requests from a single IP address or user.

4.  **Protected Routes:**
    *   **Objective:** Secure API endpoints that require user authentication.
    *   **Details:**
        *   Apply the `get_current_user` FastAPI dependency to all routes that should only be accessible by authenticated users (e.g., story generation, chapter retrieval, saving user data).

## II. Security & Robustness Improvements

These are additional measures to enhance the security and reliability of the authentication system.

5.  **Input Validation (Pydantic):**
    *   **Objective:** Ensure user-provided data meets security and format requirements.
    *   **Details:**
        *   Strengthen Pydantic models for user registration and login to enforce password complexity rules (e.g., minimum length, requirement for uppercase, lowercase, numbers, special characters).
        *   Implement strict email format validation.

6.  **Error Handling and Logging:**
    *   **Objective:** Improve system observability and provide better user feedback.
    *   **Details:**
        *   Implement more granular error handling for authentication failures, providing clear but non-descriptive messages to the client (e.g., "Invalid credentials" instead of "User not found").
        *   Add comprehensive logging for all authentication-related events (login attempts, failures, registrations, token refreshes, password changes) for auditing and debugging purposes.

7.  **CORS Configuration Refinement:**
    *   **Objective:** Enhance security by strictly controlling allowed origins in production.
    *   **Details:**
        *   In a production environment, modify the `CORSMiddleware` configuration to explicitly list only the trusted frontend domains in `allow_origins`, avoiding the use of `"*"` which is insecure for production.

8.  **Password Reset Mechanism:**
    *   **Objective:** Allow users to securely regain access to their accounts if they forget their password.
    *   **Details:**
        *   Implement a "forgot password" flow that involves sending a unique, time-limited token to the user's registered email address.
        *   Create an endpoint for users to reset their password using this token.

9.  **Account Verification (Email):**
    *   **Objective:** Confirm the validity of user email addresses and prevent spam registrations.
    *   **Details:**
        *   Implement an email verification process for new registrations, requiring users to click a link in an email to activate their account.

## III. Frontend Integration

These steps focus on updating the frontend to fully utilize the new backend authentication features.

10. **Update `AuthContext.jsx` for JWTs:**
    *   **Objective:** Adapt the frontend authentication context to handle JWTs.
    *   **Details:**
        *   Modify the `login` and `register` functions to correctly store the received `access_token` and `refresh_token` (e.g., `access_token` in memory/state, `refresh_token` in HTTP-only cookie if possible, or secure local storage).
        *   Implement logic to use the `refresh_token` to obtain a new `access_token` when the current one expires.
        *   Update the `logout` function to clear all stored tokens and potentially send a request to the backend to invalidate the refresh token.

11. **Axios Interceptor:**
    *   **Objective:** Automate token management for API requests.
    *   **Details:**
        *   Create an Axios instance with an interceptor that automatically attaches the current `access_token` to the `Authorization` header of all outgoing requests.
        *   Implement logic within the interceptor to catch `401 Unauthorized` responses, attempt to refresh the `access_token` using the `refresh_token`, and retry the original request. If token refresh fails, redirect the user to the login page.

12. **Protected Routes in Frontend:**
    *   **Objective:** Control access to frontend routes based on user authentication status.
    *   **Details:**
        *   Enhance `ProtectedRoute.jsx` (or similar component) to check for the presence and validity (e.g., not expired) of the `access_token` before rendering protected content. Redirect unauthenticated users to the login page.

## IV. Deployment & Operations

Considerations for moving the application to a production environment.

13. **Production Database:**
    *   **Objective:** Ensure database scalability and reliability for production.
    *   **Details:**
        *   While SQLite is excellent for development, for production environments, especially with anticipated growth or concurrent users, consider migrating to a more robust relational database like PostgreSQL or MySQL. SQLAlchemy's ORM makes this transition relatively manageable.

14. **Environment Variable Management:**
    *   **Objective:** Securely manage sensitive configuration in production.
    *   **Details:**
        *   Ensure all sensitive configurations (API keys, secrets, database credentials) are loaded from environment variables and are never hardcoded or committed to version control.

15. **Testing:**
    *   **Objective:** Maintain code quality, prevent regressions, and ensure security.
    *   **Details:**
        *   **Unit Tests:** Write comprehensive unit tests for all authentication logic, token generation/verification, and database interactions.
        *   **Integration Tests:** Develop integration tests to verify the full authentication flow from frontend to backend, including edge cases and error conditions.
        *   **Security Tests:** Conduct regular security audits, penetration testing, and vulnerability scanning to identify and address potential weaknesses.
