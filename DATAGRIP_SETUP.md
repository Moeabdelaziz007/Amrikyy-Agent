# 🗄️ DataGrip Setup Guide - Amrikyy Project

Complete guide to connect DataGrip to your Supabase database and manage the Amrikyy schema.

---

## 🚀 Quick Setup

### **Step 1: Get Supabase Connection Details**

Go to your Supabase project dashboard:
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Find **Connection Info** section

You'll need:
```
Host: db.xxxxxxxxxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-database-password]
```

### **Step 2: Create Connection in DataGrip**

1. **Open DataGrip**
2. Click **+** (New) → **Data Source** → **PostgreSQL**
3. **Fill in connection details:**

```
Name: Amrikyy Supabase
Host: db.xxxxxxxxxxxxx.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [paste your password]
```

4. **Test Connection** (should show green checkmark ✅)
5. Click **OK**

---

## 📊 Amrikyy Database Schema

### **Tables Overview**

```sql
-- 1. profiles (User profiles)
-- 2. bookings (Flight/hotel bookings)
-- 3. flight_searches (Cached search results)
-- 4. payments (Payment transactions)
-- 5. trips (Trip planning)
```

### **Quick Queries**

#### **View All Tables**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

#### **Check Profiles**
```sql
SELECT id, full_name, email, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

#### **Check Bookings**
```sql
SELECT 
    id,
    user_id,
    booking_reference,
    booking_type,
    status,
    total_price,
    created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 20;
```

#### **Check Flight Searches**
```sql
SELECT 
    origin,
    destination,
    departure_date,
    COUNT(*) as search_count
FROM flight_searches 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY origin, destination, departure_date
ORDER BY search_count DESC;
```

---

## 🔧 DataGrip Features for Amrikyy

### **1. Visual Schema Design**

**View ER Diagram:**
1. Right-click on `public` schema
2. Select **Diagrams** → **Show Visualization**
3. See all tables and relationships

**Benefits:**
- ✅ Visual table relationships
- ✅ Foreign key connections
- ✅ Column types and constraints
- ✅ Export as image

### **2. Query Console**

**Create SQL Console:**
1. Right-click database → **New** → **Query Console**
2. Write and execute queries
3. View results in table format

**Useful Queries:**

```sql
-- Get booking statistics
SELECT 
    booking_type,
    status,
    COUNT(*) as count,
    SUM(total_price) as total_revenue
FROM bookings
GROUP BY booking_type, status;

-- Get popular destinations
SELECT 
    destination,
    COUNT(*) as searches,
    AVG(passengers) as avg_passengers
FROM flight_searches
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY destination
ORDER BY searches DESC
LIMIT 10;

-- Get user activity
SELECT 
    p.full_name,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(b.total_price) as total_spent
FROM profiles p
LEFT JOIN bookings b ON p.id = b.user_id
GROUP BY p.id, p.full_name
ORDER BY total_spent DESC;
```

### **3. Data Editor**

**Edit Data Directly:**
1. Double-click any table
2. Edit cells directly
3. Press **Ctrl+Enter** to submit changes

**Use Cases:**
- Update booking status
- Fix user data
- Test payment flows
- Modify search results

### **4. Database Migrations**

**Create Migration Files:**

```sql
-- File: migrations/001_add_payment_method.sql
ALTER TABLE bookings 
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'stripe';

-- File: migrations/002_add_indexes.sql
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_flight_searches_dates ON flight_searches(departure_date, return_date);
```

**Run Migrations:**
1. Open migration file in DataGrip
2. Select all (Ctrl+A)
3. Execute (Ctrl+Enter)

### **5. Data Export/Import**

**Export Data:**
1. Right-click table → **Export Data**
2. Choose format: CSV, JSON, SQL, Excel
3. Use for backups or testing

**Import Data:**
1. Right-click table → **Import Data from File**
2. Select CSV/JSON file
3. Map columns
4. Import

---

## 🎯 Common Tasks

### **Task 1: Check Database Health**

```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
    'profiles' as table_name, COUNT(*) as rows FROM profiles
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'flight_searches', COUNT(*) FROM flight_searches;

-- Recent activity
SELECT 
    'profiles' as table_name, MAX(created_at) as last_activity FROM profiles
UNION ALL
SELECT 'bookings', MAX(created_at) FROM bookings
UNION ALL
SELECT 'flight_searches', MAX(created_at) FROM flight_searches;
```

### **Task 2: Clean Old Data**

```sql
-- Delete old flight searches (older than 7 days)
DELETE FROM flight_searches 
WHERE created_at < NOW() - INTERVAL '7 days';

-- Archive completed bookings (older than 90 days)
-- First, create archive table if not exists
CREATE TABLE IF NOT EXISTS bookings_archive AS 
SELECT * FROM bookings WHERE 1=0;

-- Move old bookings
INSERT INTO bookings_archive 
SELECT * FROM bookings 
WHERE status = 'completed' 
AND created_at < NOW() - INTERVAL '90 days';

-- Delete from main table
DELETE FROM bookings 
WHERE status = 'completed' 
AND created_at < NOW() - INTERVAL '90 days';
```

### **Task 3: Generate Test Data**

```sql
-- Insert test user
INSERT INTO profiles (id, full_name, email, phone)
VALUES (
    gen_random_uuid(),
    'Test User',
    'test@amrikyy.com',
    '+1234567890'
);

-- Insert test booking
INSERT INTO bookings (
    user_id,
    booking_reference,
    booking_type,
    status,
    total_price,
    booking_details
)
VALUES (
    (SELECT id FROM profiles WHERE email = 'test@amrikyy.com'),
    'TEST' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0'),
    'flight',
    'pending',
    299.99,
    '{"origin": "CAI", "destination": "DXB", "date": "2025-12-01"}'::jsonb
);
```

### **Task 4: Performance Optimization**

```sql
-- Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE profiles;
ANALYZE bookings;
ANALYZE flight_searches;

-- Rebuild indexes
REINDEX TABLE bookings;
REINDEX TABLE flight_searches;
```

---

## 🔍 Advanced Features

### **1. Database Diff**

Compare schemas between environments:
1. **Tools** → **Compare Databases**
2. Select source and target
3. View differences
4. Generate migration script

### **2. SQL Formatter**

Format messy SQL:
1. Select SQL code
2. **Code** → **Reformat Code** (Ctrl+Alt+L)
3. Beautiful, readable SQL ✨

### **3. Code Completion**

DataGrip provides:
- ✅ Table name completion
- ✅ Column name completion
- ✅ SQL keyword completion
- ✅ Function suggestions

### **4. Query History**

View all executed queries:
1. **View** → **Tool Windows** → **Database Console**
2. See history of all queries
3. Re-run previous queries

---

## 📱 Mobile Access (Optional)

### **Supabase Studio (Web)**

Access database from anywhere:
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select project
3. Click **Table Editor**
4. View/edit data in browser

---

## 🔒 Security Best Practices

### **1. Use Read-Only User for Analysis**

```sql
-- Create read-only user
CREATE USER amrikyy_readonly WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE postgres TO amrikyy_readonly;
GRANT USAGE ON SCHEMA public TO amrikyy_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO amrikyy_readonly;

-- Use this user in DataGrip for safe querying
```

### **2. Never Expose Credentials**

- ❌ Don't commit DataGrip connection files
- ❌ Don't share screenshots with credentials
- ✅ Use environment variables
- ✅ Rotate passwords regularly

### **3. Backup Before Changes**

```sql
-- Backup table before modifications
CREATE TABLE bookings_backup AS 
SELECT * FROM bookings;

-- Restore if needed
TRUNCATE bookings;
INSERT INTO bookings SELECT * FROM bookings_backup;
```

---

## 🎨 DataGrip Shortcuts

| Action | Shortcut |
|--------|----------|
| Execute Query | Ctrl+Enter |
| Execute All | Ctrl+Shift+Enter |
| Format Code | Ctrl+Alt+L |
| Auto-complete | Ctrl+Space |
| Find Table | Ctrl+N |
| Recent Files | Ctrl+E |
| Database Console | Ctrl+Shift+F10 |

---

## 🐛 Troubleshooting

### **Connection Failed**

**Error**: "Connection refused"

**Solutions:**
1. Check Supabase project is active
2. Verify host/port are correct
3. Check firewall settings
4. Ensure password is correct

### **SSL Required**

**Error**: "SSL connection required"

**Solution:**
1. In DataGrip connection settings
2. Go to **SSH/SSL** tab
3. Enable **Use SSL**
4. Select **Require** or **Verify-CA**

### **Slow Queries**

**Issue**: Queries taking too long

**Solutions:**
```sql
-- Add indexes
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_flight_searches_origin_dest ON flight_searches(origin, destination);

-- Analyze tables
ANALYZE bookings;
ANALYZE flight_searches;
```

---

## 📚 Useful Resources

- [DataGrip Documentation](https://www.jetbrains.com/help/datagrip/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

## 🎯 Next Steps

1. ✅ Connect DataGrip to Supabase
2. ✅ Explore existing tables
3. ✅ Create useful queries
4. ✅ Set up data export/backup
5. ✅ Create migration scripts
6. ✅ Optimize with indexes

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

Need help with specific queries or database optimization? Let me know! 🚀
