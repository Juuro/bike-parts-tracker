# 🔧 Strava Integration Troubleshooting

## Error: "Authorization Error - invalid"

This error typically occurs due to mismatched redirect URIs or incorrect Strava app configuration.

## ✅ Step-by-Step Fix

### 1. Check Your Strava App Settings

Go to https://www.strava.com/settings/api and verify these settings for your app:

- **Application Name**: Bike Parts Tracker (or your preferred name)
- **Category**: Choose "Visualizer" or "Training"
- **Website**: `http://localhost:3001` (for development)
- **Authorization Callback Domain**: `localhost`

### 2. Important: Authorization Callback Domain

The **Authorization Callback Domain** must be set to:

- `localhost` (for development)
- Your actual domain (for production, e.g., `yourdomain.com`)

**Do NOT include:**

- `http://` or `https://`
- Port numbers
- Paths

### 3. Verify Environment Variables

Your `.env.local` should have:

```bash
STRAVA_CLIENT_ID=15887
STRAVA_CLIENT_SECRET=ed5f6ecac15eef81cd5d43796bb9ba69bbc3fda0
NEXT_PUBLIC_STRAVA_CLIENT_ID=15887
```

### 4. Test the OAuth URL

The OAuth URL being generated should look like:

```
https://www.strava.com/oauth/authorize?client_id=15887&response_type=code&redirect_uri=http%3A//localhost%3A3001/api/auth/callback/strava&approval_prompt=force&scope=read,activity:read_all,profile:read_all&state=random_state
```

### 5. Common Issues & Solutions

| Issue                  | Solution                                       |
| ---------------------- | ---------------------------------------------- |
| "invalid client_id"    | Double-check STRAVA_CLIENT_ID matches your app |
| "invalid redirect_uri" | Ensure callback domain is just "localhost"     |
| "invalid scope"        | Use: `read,activity:read_all,profile:read_all` |
| "invalid grant"        | Check client secret is correct                 |

### 6. Debug Steps

1. **Check the browser console** when clicking "Connect to Strava"
2. **Verify the OAuth URL** in the popup window
3. **Check server logs** in the terminal for detailed error messages
4. **Test with curl** (see below)

### 7. Manual Test with curl

You can test the token exchange manually:

```bash
# First, get an authorization code by visiting this URL in browser:
# https://www.strava.com/oauth/authorize?client_id=15887&response_type=code&redirect_uri=http://localhost:3001/api/auth/callback/strava&scope=read&approval_prompt=force

# Then test the token exchange (replace CODE_FROM_CALLBACK):
curl -X POST https://www.strava.com/oauth/token \
  -F client_id=15887 \
  -F client_secret=ed5f6ecac15eef81cd5d43796bb9ba69bbc3fda0 \
  -F code=CODE_FROM_CALLBACK \
  -F grant_type=authorization_code
```

### 8. If Still Having Issues

1. **Delete and recreate** your Strava app
2. **Use a minimal scope** first: just `read`
3. **Check Strava API status**: https://strava.com/developer
4. **Try the authorization in an incognito window**

### 9. Production Setup

For production, update your Strava app settings:

- **Website**: `https://yourdomain.com`
- **Authorization Callback Domain**: `yourdomain.com`

And update your environment variables:

```bash
STRAVA_CLIENT_ID=your_production_client_id
STRAVA_CLIENT_SECRET=your_production_client_secret
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_production_client_id
```

## 🐛 Additional Debugging

I've added console logging to help debug. Check your browser console and server terminal for:

- OAuth parameters being sent
- Token request payload
- Detailed error messages

Try connecting again and check the logs for more specific error information!
