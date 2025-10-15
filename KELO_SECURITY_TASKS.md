# KELO - Security Sprint Tasks (STREAM 2)
## Database + Infrastructure Security Fixes

**Assigned To:** Kelo Agent  
**Total Time:** 24 hours (2-3 days)  
**Priority:** 🔴 CRITICAL  
**Vulnerabilities:** 7 critical/high issues

---

## 🎯 YOUR MISSION

Fix all database and infrastructure security vulnerabilities to enable safe production deployment.

**Your Work Stream (STREAM 2):**
- Database RLS bypass
- Input validation
- Memory fallback issues
- Database rate limiting
- Backup strategy
- Connection pooling
- Database indexes

---

## ✅ TASK LIST

### Phase 1: Critical Database Security (12 hours)

#### ☐ Task 1: Fix Service Role Key Bypass (DB-VULN-001) - 4 hours

**CRITICAL - Highest Priority**

**File:** `backend/database/supabase.js:11-28`

**Problem:** Using service role key bypasses all Row Level Security policies

**Fix:**

```javascript
const { createClient } = require('@supabase/supabase-js');

class SecureSupabaseClient {
  constructor() {
    // Public client with RLS for user operations
    this.anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY  // ✅ Uses anon key with RLS
    );
    
    // Admin client only for specific admin operations
    this.adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  
  // User operations use anon client with user JWT
  async getUserProfile(telegramId, userJwt) {
    const client = this.anonClient.auth.setAuth(userJwt);
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Admin operations explicitly marked
  async adminGetAllUsers() {
    console.warn('⚠️ Using admin access - this bypasses RLS');
    const { data, error } = await this.adminClient
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return data;
  }
}
```

**Set up RLS policies in Supabase:**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Test:**
1. Try to access another user's data (should fail)
2. Access own data (should succeed)
3. Admin operations (should work with warning log)

---

#### ☐ Task 2: Add Input Validation (DB-VULN-002) - 3 hours

**File:** `backend/database/supabase.js`

**Problem:** No validation of user inputs before database operations

**Fix:**

```javascript
// Add validation functions
const validateTelegramId = (id) => {
  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new Error('Invalid telegram_id type');
  }
  
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0 || numId > Number.MAX_SAFE_INTEGER) {
    throw new Error('Invalid telegram_id value');
  }
  
  return numId;
};

const validateUserData = (data) => {
  const schema = {
    username: (v) => typeof v === 'string' && v.length > 0 && v.length <= 100,
    first_name: (v) => !v || (typeof v === 'string' && v.length <= 100),
    last_name: (v) => !v || (typeof v === 'string' && v.length <= 100),
    preferences: (v) => !v || (typeof v === 'object' && v !== null),
    travel_history: (v) => !v || Array.isArray(v)
  };
  
  for (const [key, validator] of Object.entries(schema)) {
    if (data[key] !== undefined && !validator(data[key])) {
      throw new Error(`Invalid ${key}`);
    }
  }
  
  return data;
};

const validateMessageData = (data) => {
  if (!data.content || typeof data.content !== 'string') {
    throw new Error('Invalid message content');
  }
  
  if (data.content.length > 10000) {
    throw new Error('Message too long');
  }
  
  if (!['user', 'assistant'].includes(data.role)) {
    throw new Error('Invalid message role');
  }
  
  return data;
};

// Apply in all methods
async createUserProfile(telegramId, userData) {
  const validId = validateTelegramId(telegramId);
  const validData = validateUserData(userData);
  
  const { data, error } = await this.anonClient
    .from('profiles')
    .insert([{ 
      telegram_id: validId, 
      ...validData 
    }]);
    
  if (error) throw error;
  return data;
}

async saveMessage(telegramId, messageData) {
  const validId = validateTelegramId(telegramId);
  const validMessage = validateMessageData(messageData);
  
  const { data, error } = await this.anonClient
    .from('messages')
    .insert([{
      user_id: validId,
      ...validMessage
    }]);
    
  if (error) throw error;
  return data;
}
```

**Test:**
1. Send invalid telegram_id (should reject)
2. Send malformed user data (should reject)
3. Send valid data (should succeed)

---

#### ☐ Task 3: Remove Memory Fallback (DB-VULN-003) - 2 hours

**File:** `backend/database/supabase.js:14-28`

**Problem:** Falls back to in-memory storage (data loss on restart)

**Fix:**

```javascript
constructor() {
  // Validate required environment variables
  if (!process.env.SUPABASE_URL) {
    throw new Error('❌ FATAL: SUPABASE_URL environment variable is required');
  }
  
  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('❌ FATAL: SUPABASE_ANON_KEY environment variable is required');
  }
  
  // Create clients (no fallback!)
  this.anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  this.adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  // REMOVE THESE LINES:
  // this.memoryStorage = { profiles: new Map(), messages: new Map() };
}
```

**Update all methods to remove memory fallback logic**

**Test:**
1. Start without env vars (should fail to start)
2. Start with env vars (should succeed)

---

#### ☐ Task 4: Add Database Rate Limiting (DB-VULN-004) - 2 hours

**File:** `backend/database/supabase.js`

**Problem:** No rate limiting on database queries

**Fix:**

```javascript
class SecureSupabaseClient {
  constructor() {
    // ... existing constructor
    
    // Add rate limiter
    this.queryLimiter = new Map();
  }
  
  async rateLimit(userId, operation) {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const limits = this.queryLimiter.get(key) || { 
      count: 0, 
      resetAt: now + 60000 
    };
    
    if (now > limits.resetAt) {
      limits.count = 0;
      limits.resetAt = now + 60000;
    }
    
    limits.count++;
    this.queryLimiter.set(key, limits);
    
    if (limits.count > 100) {
      throw new Error('Rate limit exceeded for database operation');
    }
  }
  
  // Apply to all user-facing methods
  async getUserProfile(telegramId, userJwt) {
    await this.rateLimit(telegramId, 'getUserProfile');
    
    const client = this.anonClient.auth.setAuth(userJwt);
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  async saveMessage(telegramId, messageData, userJwt) {
    await this.rateLimit(telegramId, 'saveMessage');
    
    // ... rest of method
  }
  
  // Add to all other methods...
}
```

**Test:**
1. Make 100 rapid requests (should succeed)
2. Make 101st request (should fail with rate limit error)
3. Wait 1 minute and retry (should succeed)

---

#### ☐ Task 5: Implement Backup Strategy (DB-VULN-005) - 1 hour

**Create:** `backend/scripts/backup-database.js`

```javascript
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = path.join(__dirname, '../../backups');
  const filename = `backup-${timestamp}.sql`;
  const filePath = path.join(backupDir, filename);
  
  // Ensure backup directory exists
  await fs.mkdir(backupDir, { recursive: true });
  
  // Supabase backup command
  const command = `
    PGPASSWORD=${process.env.SUPABASE_DB_PASSWORD} pg_dump \
      -h ${process.env.SUPABASE_DB_HOST} \
      -U ${process.env.SUPABASE_DB_USER} \
      -d ${process.env.SUPABASE_DB_NAME} \
      -f ${filePath}
  `;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error.message);
        reject(error);
        return;
      }
      console.log(`✅ Backup created: ${filename}`);
      resolve(filePath);
    });
  });
}

// Cleanup old backups (keep last 7 days)
async function cleanupOldBackups() {
  const backupDir = path.join(__dirname, '../../backups');
  const files = await fs.readdir(backupDir);
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const stats = await fs.stat(filePath);
    
    if (now - stats.mtime.getTime() > sevenDays) {
      await fs.unlink(filePath);
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  }
}

// Run backup daily
async function startBackupService() {
  console.log('🔄 Starting database backup service...');
  
  // Run immediately on start
  await backupDatabase();
  await cleanupOldBackups();
  
  // Run daily
  setInterval(async () => {
    await backupDatabase();
    await cleanupOldBackups();
  }, 24 * 60 * 60 * 1000);
}

// Export for use in main server
module.exports = { backupDatabase, startBackupService };

// Run standalone
if (require.main === module) {
  startBackupService().catch(console.error);
}
```

**Update `package.json`:**

```json
{
  "scripts": {
    "backup": "node backend/scripts/backup-database.js",
    "backup:restore": "psql $DATABASE_URL -f backups/<backup-file>"
  }
}
```

**Update `.env.template`:**

```env
# Database backup credentials
SUPABASE_DB_HOST=your-host
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-password
SUPABASE_DB_NAME=postgres
```

**Test:**
1. Run manual backup
2. Verify backup file created
3. Test restore from backup

---

### Phase 2: Infrastructure & Monitoring (6 hours)

#### ☐ Task 6: Add Database Connection Pooling - 3 hours

**File:** `backend/database/supabase.js`

**Problem:** No connection pooling configured (resource exhaustion risk)

**Fix:**

```javascript
constructor() {
  // Validate env vars
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }
  
  // Configure with connection pooling
  this.anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      db: {
        poolSize: 10,                    // Max 10 connections
        connectionTimeoutMillis: 60000,  // 60s timeout
        idleTimeoutMillis: 30000         // 30s idle timeout
      },
      global: {
        headers: { 
          'Connection': 'keep-alive',
          'x-client-info': 'maya-travel-agent@1.0.0'
        }
      },
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    }
  );
  
  this.adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        poolSize: 5,  // Smaller pool for admin
        connectionTimeoutMillis: 60000,
        idleTimeoutMillis: 30000
      }
    }
  );
  
  // Connection health monitoring
  this.monitorConnections();
}

monitorConnections() {
  setInterval(() => {
    // Log connection pool status
    console.log('📊 DB Connection Pool Status:', {
      timestamp: new Date().toISOString(),
      // Add monitoring logic
    });
  }, 60000); // Every minute
}
```

**Test:**
1. Run load test with 100 concurrent requests
2. Monitor connection pool usage
3. Verify no connection exhaustion

---

#### ☐ Task 7: Add Database Indexes - 3 hours

**File:** `backend/database/enhanced-schema.sql`

**Problem:** Missing indexes on frequently queried columns (slow queries)

**Add at end of file:**

```sql
-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Added: 2025-10-13 - Security Sprint
-- ============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id 
  ON public.profiles(telegram_id);
  
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON public.profiles(user_id);
  
CREATE INDEX IF NOT EXISTS idx_profiles_last_active 
  ON public.profiles(last_active DESC);
  
CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
  ON public.profiles(created_at DESC);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id 
  ON public.messages(user_id);
  
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON public.messages(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
  ON public.messages(conversation_id);

-- Travel plans indexes
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id 
  ON public.travel_plans(user_id);
  
CREATE INDEX IF NOT EXISTS idx_travel_plans_status 
  ON public.travel_plans(status);
  
CREATE INDEX IF NOT EXISTS idx_travel_plans_start_date 
  ON public.travel_plans(start_date);

-- JSONB indexes for preferences and metadata
CREATE INDEX IF NOT EXISTS idx_profiles_preferences 
  ON public.profiles USING GIN (preferences);
  
CREATE INDEX IF NOT EXISTS idx_profiles_travel_history 
  ON public.profiles USING GIN (travel_history);
  
CREATE INDEX IF NOT EXISTS idx_messages_metadata 
  ON public.messages USING GIN (metadata);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
  ON public.messages(user_id, created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_status 
  ON public.travel_plans(user_id, status);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_messages_content_fts 
  ON public.messages USING GIN (to_tsvector('english', content));

-- Verify indexes created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Run migration:**

```bash
# Connect to Supabase and run SQL
psql $DATABASE_URL -f backend/database/enhanced-schema.sql

# Or use Supabase CLI
supabase db push
```

**Test:**
1. Run EXPLAIN ANALYZE on slow queries (before indexes)
2. Create indexes
3. Run EXPLAIN ANALYZE again (should show index usage)
4. Measure query performance improvement

---

### Phase 3: Testing & Validation (6 hours)

#### ☐ Task 8: RLS Policy Testing - 2 hours

**Create:** `backend/tests/security/rls-tests.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

describe('Row Level Security Tests', () => {
  test('User can only access own profile', async () => {
    const user1Token = 'jwt-for-user-1';
    const user2Token = 'jwt-for-user-2';
    
    const client1 = createClient(url, anonKey).auth.setAuth(user1Token);
    
    // Should succeed - own profile
    const { data: ownProfile } = await client1
      .from('profiles')
      .select('*')
      .eq('telegram_id', 'user-1-id')
      .single();
    expect(ownProfile).toBeDefined();
    
    // Should fail - other user's profile
    const { data: otherProfile, error } = await client1
      .from('profiles')
      .select('*')
      .eq('telegram_id', 'user-2-id')
      .single();
    expect(error).toBeDefined();
    expect(otherProfile).toBeNull();
  });
});
```

#### ☐ Task 9: Input Validation Testing - 1 hour

Test all validation functions with edge cases

#### ☐ Task 10: Rate Limit Testing - 1 hour

Test database query rate limits

#### ☐ Task 11: Backup/Restore Testing - 1 hour

Test backup creation and restoration

#### ☐ Task 12: Connection Pool Testing - 1 hour

Load test to verify connection pooling works

---

## 📋 CHECKLIST

### Pre-Work
- [ ] Read all security audit documents
- [ ] Understand each vulnerability
- [ ] Set up test environment
- [ ] Create feature branch: `fix/database-security-sprint`

### Implementation
- [ ] Task 1: Fix RLS bypass (4 hours)
- [ ] Task 2: Add input validation (3 hours)
- [ ] Task 3: Remove memory fallback (2 hours)
- [ ] Task 4: Add database rate limiting (2 hours)
- [ ] Task 5: Implement backup strategy (1 hour)
- [ ] Task 6: Add connection pooling (3 hours)
- [ ] Task 7: Add database indexes (3 hours)

### Testing (6 hours)
- [ ] RLS policy testing (2 hours)
- [ ] Input validation testing (1 hour)
- [ ] Rate limit testing (1 hour)
- [ ] Backup/restore testing (1 hour)
- [ ] Connection pool testing (1 hour)

### Documentation
- [ ] Update .env.template with new variables
- [ ] Document RLS policies
- [ ] Document validation rules
- [ ] Update deployment guide

### Deployment
- [ ] Code review
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Run security tests
- [ ] Deploy to production

---

## 🚨 CRITICAL NOTES

1. **Most Critical:** DB-VULN-001 (RLS bypass) - CVSS 9.8
2. **Test Thoroughly:** RLS policies are critical for data security
3. **Backup First:** Take full backup before making changes
4. **Staging Deploy:** Test all fixes in staging before production
5. **Monitor Closely:** Watch logs for 24 hours after deployment

---

## 📞 COORDINATION

**Your Partner:** Cursor Agent (STREAM 1)

**Sync Points:**
- After Phase 1 complete (12 hours)
- After Phase 2 complete (18 hours)
- Before final deployment (24 hours)

**Communication:**
- Report blockers immediately
- Share progress every 4 hours
- Coordinate testing phase

---

## ✅ SUCCESS CRITERIA

1. All 7 database vulnerabilities fixed
2. All tests passing
3. RLS policies enforced
4. Input validation on all operations
5. Backup strategy active
6. Connection pooling working
7. Indexes created and used

**Target:** Database Security Score 8.5+/10

---

**Start Date:** October 13, 2025  
**Target Completion:** October 15-16, 2025 (2-3 days)  
**Status:** 🔴 CRITICAL PRIORITY  
**Owner:** Kelo Agent

**Good luck! You've got this! 🚀**

