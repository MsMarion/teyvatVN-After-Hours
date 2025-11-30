# Authentication Interaction with Story Generation & Data Gathering

## Overview
This document explains how the updated authentication system in **TeyvatVN** propagates the user’s identity (via JWT) to the story‑generation endpoint and any other data‑gathering APIs.

---

### 1. Login / Register Flow
- **Login** (`AuthContext.login`) → POST `/api/auth/login` → `authenticate_user` in `backend_server/auth.py` validates credentials and returns a **JWT**.
- **Register** (`AuthContext.register`) → POST `/api/auth/register` → `create_user` creates a new user, then calls `login` to obtain the JWT.
- **Google OAuth** (`AuthContext.googleLogin`) redirects to `/api/auth/google/login`; the backend exchanges the code for tokens and ultimately issues a JWT.
- The JWT is stored in **localStorage** (`authToken`) and kept in the React context.

---

### 2. Propagating the JWT
All subsequent API calls use the Axios instance defined in `AuthContext.jsx`:
```js
const api = axios.create({
  baseURL: API_URL.replace('/api/generate', ''),
  headers: { 'Content-Type': 'application/json' },
});
```
When a component needs to call a protected endpoint, it includes the token (e.g., via an `Authorization: Bearer <token>` header or in the request body).

---

### 3. Story‑Generation Endpoint (Protected)
```python
@router.post('/story/generate')
def generate_story(prompt: str, token: str = Depends(oauth2_scheme)):
    user = get_user_from_token(token)   # decode & verify JWT
    # Use `user.id` for quota, ownership, personalization, etc.
    generated = call_llm(prompt, user_context=user)
    return {'story': generated, 'author_id': user.id}
```
Key points:
1. **JWT extraction** via `oauth2_scheme` (or similar dependency).
2. **Verification** of signature and expiry.
3. **User ID** is now available to the generation logic, enabling per‑user limits, saving results under the user, and personalising prompts.
4. Missing/invalid token → **401 Unauthorized**.

---

### 4. Other Data‑Gathering Services
Any backend route that needs the caller’s identity follows the same pattern:
- `GET /api/users/me` – returns the user object.
- `GET /api/story/history` – queries stories where `owner_id = user.id`.
- `POST /api/analytics/event` – logs the event with `user.id`.
All rely on the JWT‑based auth dependency, providing a consistent security model.

---

### 5. Front‑End Consumption
Components retrieve the token from context and include it in requests:
```js
const { token } = useAuth();
api.post('/api/story/generate', { prompt, token })
   .then(res => setStory(res.data.story));
```
Because the token lives in React context, any component can access it without duplicating auth logic.

---

## Summary
The JWT issued at login becomes the single source of truth for user identity. It is attached to every protected API call, allowing the backend to:
- Authenticate the request,
- Associate generated stories and other data with the correct user,
- Enforce per‑user quotas and personalization.
Thus, the authentication system seamlessly integrates with story generation and all other data‑gathering features.

*Generated on 2025‑11‑29.*
