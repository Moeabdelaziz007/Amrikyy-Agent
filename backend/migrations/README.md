# Database Migrations

This folder contains SQL migration files for the Amrikyy backend database.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file
4. Run them in order (001, 002, 003, etc.)
5. Verify success messages

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref driujancggfxgdsuyaih

# Run migrations
supabase db push
```

### Option 3: Direct SQL
```bash
# Using psql
psql "postgresql://postgres:[PASSWORD]@db.driujancggfxgdsuyaih.supabase.co:5432/postgres" -f migrations/001_create_profiles.sql
```

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_create_profiles.sql` | Create profiles table | ✅ Ready |
| `002_create_bookings.sql` | Create bookings table | ⏳ Next |
| `003_create_flight_searches.sql` | Create flight searches cache | ⏳ Pending |
| `004_profiles_rls.sql` | Add RLS policies for profiles | ⏳ Pending |
| `005_bookings_rls.sql` | Add RLS policies for bookings | ⏳ Pending |
| `006_create_indexes.sql` | Create performance indexes | ⏳ Pending |
| `007_functions_triggers.sql` | Create functions and triggers | ⏳ Pending |
| `008_test_data.sql` | Insert test data | ⏳ Pending |

## Migration Order

**IMPORTANT**: Run migrations in numerical order!

1. ✅ `001_create_profiles.sql` - Creates profiles table
2. ⏳ `002_create_bookings.sql` - Creates bookings table
3. ⏳ `003_create_flight_searches.sql` - Creates cache table
4. ⏳ `004_profiles_rls.sql` - Secures profiles
5. ⏳ `005_bookings_rls.sql` - Secures bookings
6. ⏳ `006_create_indexes.sql` - Optimizes queries
7. ⏳ `007_functions_triggers.sql` - Adds automation
8. ⏳ `008_test_data.sql` - Tests schema

## Rollback

To rollback a migration, create a corresponding rollback file:

```sql
-- Example: 001_create_profiles_rollback.sql
DROP TABLE IF EXISTS public.profiles CASCADE;
```

## Testing

After running migrations:

1. Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. Verify RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

3. Test with sample data:
```sql
-- Insert test profile
INSERT INTO profiles (id, full_name) 
VALUES ('test-uuid', 'Test User');
```

## Notes

- All migrations use `IF NOT EXISTS` to be idempotent
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- All tables have proper indexes
- All tables have RLS enabled
- All tables have comments for documentation

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify environment variables
3. Check database permissions
4. Review migration file syntax

---

**Last Updated**: October 21, 2025  
**Status**: Migration 001 ready to run
