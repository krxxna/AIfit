# TODO - Google OAuth 2.0 (Authorization Code Flow)

- [x] Update backend `backend/src/routes/auth.js`:

  - [ ] Add OAuth2.0 endpoints:
    - [ ] `GET /api/auth/google/url` to return Google consent URL
    - [ ] `GET /api/auth/google/callback` to exchange `code` for tokens, verify ID token, upsert user, and redirect with JWT
- [ ] Update frontend `frontend/src/components/AuthPanel.jsx`:
  - [ ] Add Google login button that redirects browser to backend consent URL
- [ ] Update frontend `frontend/src/App.jsx`:
  - [ ] Parse `?token=` from callback redirect and authenticate/store JWT
  - [ ] Remove token param from URL after storing
- [ ] Add/confirm required env vars in `.env.example` (or `.env` if present):
  - [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_OAUTH_SCOPES`
- [ ] Run backend/frontend locally and test OAuth login end-to-end

