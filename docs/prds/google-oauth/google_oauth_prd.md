# Product Requirements Document: Google OAuth2 Login

## 1. Introduction

This document outlines the requirements for integrating Google OAuth2 as an authentication method into the TeyvatVN application. The primary goal is to provide users with a convenient and secure way to register and log in using their existing Google accounts, enhancing user experience and reducing friction during the onboarding process.

## 2. Goals

*   **Ease of Use:** Allow users to register and log in with minimal steps using their Google credentials.
*   **Security:** Leverage Google's robust authentication infrastructure to ensure secure user authentication.
*   **User Retention:** Reduce registration barriers, potentially increasing user sign-ups and engagement.
*   **Data Consistency:** Ensure user data (username, email) obtained from Google is correctly mapped and stored in our internal database.

## 3. Scope

This PRD covers the backend and frontend implementation required for Google OAuth2 login.

### 3.1. In-Scope

*   Initiating Google OAuth2 flow from the frontend.
*   Handling Google's callback on the backend.
*   Exchanging authorization codes for access and ID tokens.
*   Extracting user information (email, name, profile picture URL) from Google's ID token.
*   Creating a new user account in our internal database if the Google-provided email does not exist.
*   Logging in existing users whose Google email matches an existing account.
*   Generating and returning our application's JWT (access token) upon successful Google login/registration.
*   Updating the frontend to display a "Login with Google" button.

### 3.2. Out-of-Scope (for this phase)

*   Linking multiple social accounts to a single TeyvatVN account.
*   Unlinking Google accounts.
*   Advanced profile synchronization beyond initial registration.
*   Handling Google refresh tokens for long-term sessions (covered in the broader Authentication System Roadmap).
*   Detailed error handling for all possible Google API errors (basic error handling will be in place).

## 4. User Stories

*   As a **new user**, I want to log in with my Google account so that I don't have to create a new username and password.
*   As an **existing user**, I want to log in with my Google account so that I can quickly access my account without remembering my TeyvatVN password.
*   As a **system administrator**, I want Google OAuth2 to securely authenticate users so that our application's security posture is maintained.
*   As a **developer**, I want the Google OAuth2 integration to be robust and maintainable so that future updates are straightforward.

## 5. Functional Requirements

### 5.1. Frontend

*   **FR.FE.1:** Display a "Login with Google" button on the login/registration page.
*   **FR.FE.2:** Upon clicking the "Login with Google" button, redirect the user to Google's authorization page.
*   **FR.FE.3:** Handle the redirect back from Google, passing the authorization code to the backend.
*   **FR.FE.4:** Upon successful authentication via Google, receive and store the application's JWT (access token) from the backend.
*   **FR.FE.5:** Redirect the user to the main application dashboard after successful Google login.

### 5.2. Backend

*   **FR.BE.1:** Provide an endpoint (`/api/auth/google/login`) that generates and returns Google's authorization URL.
*   **FR.BE.2:** Provide a callback endpoint (`/api/auth/google/callback`) to receive the authorization code from Google.
*   **FR.BE.3:** Exchange the authorization code for Google's access token and ID token.
*   **FR.BE.4:** Decode the ID token to extract user information (email, name, etc.).
*   **FR.BE.5:** Check if a user with the extracted email already exists in the internal database.
    *   **FR.BE.5.1:** If the user exists, log them in.
    *   **FR.BE.5.2:** If the user does not exist:
        *   Generate a temporary "partial registration" token containing the user's email and name.
        *   Redirect the user to the frontend `/complete-registration` page with this token.
        *   Allow the user to choose a username to complete the account creation process.
*   **FR.BE.6:** Generate and return a TeyvatVN-specific JWT (access token) to the frontend upon successful authentication/registration via Google.
*   **FR.BE.7:** Handle errors during the OAuth2 flow (e.g., invalid code, Google API errors) and return appropriate HTTP status codes and messages.

## 6. Non-Functional Requirements

*   **Performance:** The Google OAuth2 flow should be responsive, with minimal latency during redirects and token exchanges.
*   **Security:**
    *   All communication with Google's OAuth2 endpoints must use HTTPS.
    *   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be stored securely as environment variables.
    *   The `SECRET_KEY` for signing internal JWTs must be strong and kept confidential.
    *   The redirect URI must be strictly validated.
*   **Scalability:** The solution should be able to handle an increasing number of Google login requests without significant performance degradation.
*   **Maintainability:** The code should be well-structured, commented, and follow established coding standards.

## 7. Technical Design Considerations

*   **Libraries:** `httpx` for HTTP requests to Google, `python-jose` for JWT handling.
*   **Database:** SQLite (for development), with SQLAlchemy ORM for user management.
*   **Environment Variables:** Utilize `.env` for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SECRET_KEY`.
*   **FastAPI:** Leverage FastAPI's dependency injection and routing for clean endpoint definitions.
*   **Frontend Framework:** React (as per existing project structure).

## 8. Open Questions / Future Considerations

*   How will user profile pictures from Google be handled and stored (if at all)?
*   What is the strategy for handling users who initially register with Google but later want to set a local password?
*   Should Google refresh tokens be stored and used for long-lived sessions, or will our internal refresh token mechanism suffice? (This is covered in the broader roadmap).
*   What specific error messages should be displayed to the user for different failure scenarios?

## 9. Success Metrics

*   Successful Google login rate > 95%.
*   Reduction in manual registration abandonment rate.
*   Positive user feedback regarding the ease of login.
