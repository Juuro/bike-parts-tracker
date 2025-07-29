# Unit Tables Issue - Profile Management

## Problem
The profile update functionality is failing due to foreign key constraints on unit tables (`currency_unit`, `weight_unit`, `distance_unit`) that are currently empty.

## Current Status
- ✅ User dropdown with profile access implemented
- ✅ Profile page with comprehensive form created  
- ✅ Update permissions added to users table in Hasura
- ❌ Unit preferences cannot be saved due to empty unit tables

## Temporary Solution Applied
Modified `app/actions/updateUserProfile.ts` to only update:
- ✅ Name
- ✅ Profile image
- ✅ Strava username
- ❌ Currency unit (temporarily disabled)
- ❌ Weight unit (temporarily disabled) 
- ❌ Distance unit (temporarily disabled)

## Permanent Solution Required
1. **Populate unit tables** with seed data using `seeds/unit_tables_seed.sql`
2. **Restore full mutation** in `updateUserProfile.ts` to include unit fields
3. **Test all profile functionality** end-to-end

## SQL Script Created
`/seeds/unit_tables_seed.sql` contains the necessary INSERT statements to populate:
- `currency_unit` table with: USD, EUR, GBP, CHF, CAD, AUD, JPY
- `weight_unit` table with: kg, lbs, g  
- `distance_unit` table with: km, mi

## Next Steps
1. Execute the SQL seed script against the database
2. Restore the complete mutation with unit fields
3. Test profile updates with unit preferences

## Files Modified
- ✅ `metadata/databases/bikepartstracker/tables/public_users.yaml` - Added update permissions
- ✅ `app/actions/updateUserProfile.ts` - Temporarily disabled unit fields
- ✅ `seeds/unit_tables_seed.sql` - Created seed data for unit tables
