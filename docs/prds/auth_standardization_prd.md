# Product Requirements Document: Authentication System Standardization

## 1. Introduction
This document outlines the roadmap for standardizing the authentication system of TeyvatVN. The goal is to align with industry best practices for security, user experience, and maintainability.

## 2. Phasing Strategy
The implementation is divided into two distinct phases to prioritize security before expanding feature sets.

- **Phase 1: Security Hardening (The "Secure Core")** - Focuses on mitigating vulnerabilities (XSS, CSRF) and establishing a robust session management system.
- **Phase 2: User Lifecycle (The "Feature Complete")** - Focuses on standard user flows like password recovery and account verification.

---

## 3. Phase 1: Security Hardening (Secure Core)

### 3.1. Goals
- Eliminate `localStorage` for sensitive token storage to mitigate XSS risks.
- Implement a secure, rotating refresh token mechanism for better session management.
- Harden API security with strict CORS and security headers.

### 3.2. Functional Requirements

#### 3.2.1. HttpOnly Cookie Storage
- **FR.1.1:** The backend MUST return the Access Token and Refresh Token in `HttpOnly`, `Secure`, `SameSite=Strict` cookies upon successful login/registration.
- **FR.1.2:** The frontend MUST NOT access these tokens via JavaScript.
- **FR.1.3:** The backend MUST read tokens from cookies for all protected endpoints.

#### 3.2.2. Refresh Token Rotation
- **FR.1.4:** Implement a `/api/auth/refresh` endpoint.
- **FR.1.5:** Access Tokens MUST have a short lifespan (e.g., 15 minutes).
- **FR.1.6:** Refresh Tokens MUST have a longer lifespan (e.g., 7 days).
- **FR.1.7:** When a Refresh Token is used, a NEW Refresh Token and Access Token MUST be issued (Rotation), and the old one invalidated.

#### 3.2.3. Security Headers & CORS
- **FR.1.8:** Configure CORS to ONLY allow requests from the specific frontend origin (no wildcards `*`).
- **FR.1.9:** Implement security headers (Helmet equivalent) including `Content-Security-Policy`, `X-Frame-Options`, and `X-Content-Type-Options`.

### 3.3. Technical Implementation Notes
- **Library:** Use `FastAPI`'s `Response` object to set cookies.
- **Database:** Add a `refresh_tokens` table/collection to track valid tokens and support revocation.

---

## 4. Phase 2: User Lifecycle (Feature Complete)

### 4.1. Goals
- Ensure users own their email addresses.
- Provide a recovery mechanism for lost passwords.
- Protect the system from abuse via rate limiting.

### 4.2. Functional Requirements

#### 4.2.1. Email Verification
- **FR.2.1:** Upon registration, the user's account status MUST be `unverified`.
- **FR.2.2:** Send an email with a unique verification link/code.
- **FR.2.3:** Clicking the link MUST verify the account and allow login.

#### 4.2.2. Password Reset
- **FR.2.4:** Implement `/api/auth/forgot-password` to trigger a reset email.
- **FR.2.5:** Implement `/api/auth/reset-password` to accept a token and new password.
- **FR.2.6:** Reset tokens MUST expire after a short duration (e.g., 1 hour).

#### 4.2.3. Rate Limiting
- **FR.2.7:** Implement rate limiting on `/api/auth/login` and `/api/auth/register` (e.g., 5 attempts per minute per IP).
- **FR.2.8:** Return `429 Too Many Requests` when limits are exceeded.

### 4.3. Technical Implementation Notes
- **Email Service:** Integrate with an SMTP server or service (e.g., SendGrid, AWS SES).
- **Rate Limiting:** Use `slowapi` or Redis-based limiting.

---

## 5. Success Metrics
- **Security:** Zero successful XSS token thefts in penetration testing.
- **Reliability:** 99.9% success rate for token refreshes.
- **UX:** < 1% of users reporting login issues due to session expiration.
