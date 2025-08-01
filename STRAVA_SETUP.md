# Strava Integration Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
```

## How to Get Strava API Credentials

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Use these settings:

   - **Application Name**: Bike Parts Tracker
   - **Category**: Web Service
   - **Website**: http://localhost:3001 (or your domain)
   - **Authorization Callback Domain**: localhost (or your domain)

4. After creating the app, you'll get:
   - **Client ID** - Add this to both `STRAVA_CLIENT_ID` and `NEXT_PUBLIC_STRAVA_CLIENT_ID`
   - **Client Secret** - Add this to `STRAVA_CLIENT_SECRET`

## Database Migration

Run this SQL migration to add Strava fields to your users table:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS strava_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS strava_access_token TEXT,
ADD COLUMN IF NOT EXISTS strava_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS strava_expires_at BIGINT,
ADD COLUMN IF NOT EXISTS strava_connected_at TIMESTAMP WITH TIME ZONE;
```

## Update Hasura Metadata

You'll need to update the users table permissions in Hasura to include the new Strava fields:

1. Go to Hasura Console
2. Navigate to Data > public > users > Permissions
3. Edit the `user` role permissions
4. Add these columns to both select and update permissions:
   - strava_id
   - strava_access_token
   - strava_refresh_token
   - strava_expires_at
   - strava_connected_at

## Features Implemented

✅ **OAuth Integration** - Secure Strava authorization flow
✅ **Token Management** - Automatic token refresh when expired
✅ **Connection Status** - Real-time connection status display
✅ **Disconnect Option** - Users can disconnect their Strava account
✅ **Profile Integration** - Strava connection embedded in user profile
✅ **API Endpoints** - Full API for Strava operations:

- `/api/strava/status` - Check connection status
- `/api/strava/connect` - Handle OAuth callback
- `/api/strava/disconnect` - Disconnect account

## Next Steps

1. Set up the environment variables above
2. Run the database migration
3. Update Hasura permissions
4. Test the integration at http://localhost:3001/profile

The Strava integration will allow users to:

- Connect their Strava account securely
- Sync bike data from Strava activities
- Import gear information from Strava
- Track cycling activities automatically
