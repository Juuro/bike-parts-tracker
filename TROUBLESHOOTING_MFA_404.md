# Troubleshooting MFA 404 Errors

## Current Status

✅ **API Endpoint Working**: `/api/mfa/status` now responds correctly:

- Returns 401 "Authentication required" when not signed in (correct)
- Should return 200 with MFA status when signed in

## Troubleshooting Steps

### 1. Clear Browser Cache

The browser might be caching the old 404 response. Try:

- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Open browser dev tools > Network tab > check "Disable cache"
- Or use incognito/private browsing mode

### 2. Verify Authentication State

Make sure you're actually signed in when testing:

- Visit `/auth/signin` and sign in with Google or credentials
- Check that your user session is active
- Look for session cookies in dev tools > Application > Cookies

### 3. Check Network Tab

In browser dev tools > Network tab, when you click "Set Up Passkey":

- What exact URL is being called?
- What HTTP status code do you see? (should be 401 if not signed in, 200 if signed in)
- Are there any cookies being sent with the request?

### 4. Test Authentication

Visit these URLs in your browser while signed in:

- `http://localhost:3000/api/mfa/status` (should return JSON with MFA status)
- `http://localhost:3000/api/auth/session` (should return session info)

### 5. Console Logs

Check browser console for any JavaScript errors that might prevent the request from being made correctly.

## Expected Behavior

**When NOT signed in:**

```
GET /api/mfa/status → 401 Unauthorized
{"error":"Authentication required"}
```

**When signed in:**

```
GET /api/mfa/status → 200 OK
{
  "mfaEnabled": false,
  "totpConfigured": false,
  "webauthnEnabled": false,
  "backupCodesCount": 0,
  "authenticators": []
}
```

## Quick Test

Try this in browser console while on the security page:

```javascript
fetch("/api/mfa/status")
  .then((r) => r.json())
  .then(console.log);
```

This will show you exactly what response you're getting.
