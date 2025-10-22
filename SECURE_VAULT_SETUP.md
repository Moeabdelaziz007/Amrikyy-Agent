# 🔐 Secure Vault & Sabre Integration Setup

**Complete guide for encryption, secure credential storage, and Sabre GDS integration**

---

## 📋 TABLE OF CONTENTS

1. [Environment Variables](#environment-variables)
2. [Database Setup](#database-setup)
3. [Encryption Service](#encryption-service)
4. [Secure Vault](#secure-vault)
5. [Coinbase Integration](#coinbase-integration)
6. [Sabre GDS Integration](#sabre-gds-integration)
7. [API Routes](#api-routes)
8. [Frontend Usage](#frontend-usage)
9. [Testing](#testing)
10. [Security Best Practices](#security-best-practices)

---

## 🔑 ENVIRONMENT VARIABLES

### **Backend (.env)**

```bash
# ============================================
# ENCRYPTION
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=your-32-byte-base64-encoded-key

# ============================================
# COINBASE COMMERCE
# ============================================
COINBASE_COMMERCE_API_KEY=c100898f-e713-402b-b9d3-66421db017e5
COINBASE_WEBHOOK_SECRET=your-webhook-secret

# ============================================
# SABRE GDS
# ============================================
SABRE_CLIENT_ID=your-sabre-client-id
SABRE_CLIENT_SECRET=your-sabre-client-secret
SABRE_PCC=your-pcc-code
SABRE_API_URL=https://api.havail.sabre.com

# ============================================
# SUPABASE (for secure vault storage)
# ============================================
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# SERVER
# ============================================
PORT=3000
NODE_ENV=development
```

### **Generate Encryption Key**

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 2: Using OpenSSL
openssl rand -base64 32

# Method 3: Using the API
curl -X POST http://localhost:3000/api/vault/generate-key
```

---

## 💾 DATABASE SETUP

### **Create Supabase Table**

```sql
-- Create secure_vault table
CREATE TABLE IF NOT EXISTS secure_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  encrypted_value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, key_name)
);

-- Create index for faster lookups
CREATE INDEX idx_secure_vault_provider ON secure_vault(provider);
CREATE INDEX idx_secure_vault_key_name ON secure_vault(key_name);

-- Enable Row Level Security (RLS)
ALTER TABLE secure_vault ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage vault"
  ON secure_vault
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_secure_vault_updated_at
  BEFORE UPDATE ON secure_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 ENCRYPTION SERVICE

### **Features**

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Random IV**: Generated for each encryption
- **Authentication Tag**: Prevents tampering
- **Base64 Encoding**: For safe storage

### **Usage**

```javascript
const encryptionService = require('./src/services/EncryptionService');

// Encrypt data
const encrypted = encryptionService.encrypt('sensitive-data');

// Decrypt data
const decrypted = encryptionService.decrypt(encrypted);

// Encrypt object
const encryptedObj = encryptionService.encryptObject({ key: 'value' });

// Decrypt object
const decryptedObj = encryptionService.decryptObject(encryptedObj);

// Hash data (one-way)
const hash = encryptionService.hash('password');

// Generate secure token
const token = encryptionService.generateToken(32);

// Generate API key
const apiKey = encryptionService.generateApiKey(); // amk_...
```

---

## 🗄️ SECURE VAULT

### **Store Credentials**

```javascript
const secureVault = require('./src/services/SecureVaultService');

// Store generic credential
await secureVault.storeCredential(
  'provider-name',
  'key-name',
  'secret-value',
  { description: 'Optional metadata' }
);

// Store Coinbase credentials
await secureVault.storeCoinbaseCredentials(
  'api-key',
  'webhook-secret'
);

// Store Sabre credentials
await secureVault.storeSabreCredentials(
  'client-id',
  'client-secret',
  'pcc-code'
);

// Store Stripe credentials
await secureVault.storeStripeCredentials(
  'secret-key',
  'publishable-key',
  'webhook-secret'
);
```

### **Retrieve Credentials**

```javascript
// Get generic credential
const value = await secureVault.getCredential('provider', 'key-name');

// Get Coinbase credentials
const { apiKey, webhookSecret } = await secureVault.getCoinbaseCredentials();

// Get Sabre credentials
const { clientId, clientSecret, pcc } = await secureVault.getSabreCredentials();

// Get Stripe credentials
const { secretKey, publishableKey, webhookSecret } = await secureVault.getStripeCredentials();
```

### **Manage Credentials**

```javascript
// List credentials for a provider
const credentials = await secureVault.listCredentials('coinbase');

// Delete credential
await secureVault.deleteCredential('provider', 'key-name');

// Get vault statistics
const stats = await secureVault.getStats();

// Clear cache
secureVault.clearAllCache();
```

---

## 💰 COINBASE INTEGRATION

### **Store Credentials**

```bash
curl -X POST http://localhost:3000/api/vault/coinbase \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "c100898f-e713-402b-b9d3-66421db017e5",
    "webhookSecret": "your-webhook-secret"
  }'
```

### **Create Payment Charge**

```bash
curl -X POST http://localhost:3000/api/coinbase/charge \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Travel Booking",
    "description": "Flight to Paris",
    "amount": 500,
    "currency": "USD",
    "metadata": {
      "userId": "user_123",
      "orderId": "order_456"
    }
  }'
```

### **Response**

```json
{
  "success": true,
  "data": {
    "id": "charge_id",
    "code": "ABCD1234",
    "hosted_url": "https://commerce.coinbase.com/charges/ABCD1234",
    "pricing": {
      "local": { "amount": "500.00", "currency": "USD" },
      "bitcoin": { "amount": "0.0123", "currency": "BTC" }
    },
    "expires_at": "2025-10-22T13:00:00Z"
  }
}
```

---

## ✈️ SABRE GDS INTEGRATION

### **Store Credentials**

```bash
curl -X POST http://localhost:3000/api/vault/sabre \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "pcc": "F9CE"
  }'
```

### **Search Flights**

```bash
curl -X POST http://localhost:3000/api/sabre/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-11-01",
    "returnDate": "2025-11-08",
    "passengers": 2,
    "cabinClass": "Y"
  }'
```

### **Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "flight_123",
      "price": {
        "total": "450.00",
        "currency": "USD",
        "base": "400.00"
      },
      "legs": [
        {
          "departure": {
            "airport": "JFK",
            "time": "2025-11-01T08:00:00"
          },
          "arrival": {
            "airport": "LAX",
            "time": "2025-11-01T11:30:00"
          },
          "duration": "330",
          "stops": 0,
          "carrier": "AA",
          "flightNumber": "123"
        }
      ]
    }
  ],
  "count": 10
}
```

### **Search Hotels**

```bash
curl -X POST http://localhost:3000/api/sabre/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "LAX",
    "checkIn": "2025-11-01",
    "checkOut": "2025-11-08",
    "guests": 2,
    "rooms": 1
  }'
```

### **Search Car Rentals**

```bash
curl -X POST http://localhost:3000/api/sabre/cars/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": "LAX",
    "pickupDate": "2025-11-01",
    "returnDate": "2025-11-08",
    "pickupTime": "10:00",
    "returnTime": "10:00"
  }'
```

### **Create Booking**

```bash
curl -X POST http://localhost:3000/api/sabre/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "flight_123",
    "passengers": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    ],
    "payment": {
      "method": "card",
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123"
    }
  }'
```

### **Get Booking**

```bash
curl http://localhost:3000/api/sabre/booking/ABC123
```

### **Cancel Booking**

```bash
curl -X DELETE http://localhost:3000/api/sabre/booking/ABC123
```

---

## 🔌 API ROUTES

### **Vault Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vault/store` | Store encrypted credential |
| GET | `/api/vault/get/:provider/:keyName` | Get decrypted credential |
| DELETE | `/api/vault/delete/:provider/:keyName` | Delete credential |
| GET | `/api/vault/list/:provider` | List provider credentials |
| POST | `/api/vault/coinbase` | Store Coinbase credentials |
| GET | `/api/vault/coinbase` | Get Coinbase credentials |
| POST | `/api/vault/sabre` | Store Sabre credentials |
| GET | `/api/vault/sabre` | Get Sabre credentials |
| POST | `/api/vault/stripe` | Store Stripe credentials |
| GET | `/api/vault/stripe` | Get Stripe credentials |
| GET | `/api/vault/stats` | Get vault statistics |
| POST | `/api/vault/encrypt` | Encrypt arbitrary data |
| POST | `/api/vault/decrypt` | Decrypt arbitrary data |
| GET | `/api/vault/info` | Get encryption info |
| POST | `/api/vault/generate-key` | Generate master key |

### **Sabre Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sabre/flights/search` | Search flights |
| POST | `/api/sabre/hotels/search` | Search hotels |
| POST | `/api/sabre/cars/search` | Search car rentals |
| POST | `/api/sabre/fare-rules` | Get fare rules |
| POST | `/api/sabre/seat-map` | Get seat map |
| POST | `/api/sabre/booking/create` | Create booking |
| GET | `/api/sabre/booking/:pnr` | Get booking details |
| DELETE | `/api/sabre/booking/:pnr` | Cancel booking |
| GET | `/api/sabre/status` | Get service status |

---

## 💻 FRONTEND USAGE

### **Import Component**

```typescript
import { SecureKeyManager } from '@/components/SecureKeyManager';

export default function SettingsPage() {
  return (
    <div>
      <SecureKeyManager />
    </div>
  );
}
```

### **Features**

- ✅ Store Coinbase credentials
- ✅ Store Sabre credentials
- ✅ Store Stripe credentials
- ✅ View vault statistics
- ✅ Real-time validation
- ✅ Success/error messages
- ✅ Secure password inputs

---

## 🧪 TESTING

### **Test Encryption**

```bash
# Encrypt data
curl -X POST http://localhost:3000/api/vault/encrypt \
  -H "Content-Type: application/json" \
  -d '{"data": "secret-message"}'

# Decrypt data
curl -X POST http://localhost:3000/api/vault/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted": "base64-encrypted-data"}'
```

### **Test Vault**

```bash
# Store credential
curl -X POST http://localhost:3000/api/vault/store \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "test",
    "keyName": "api_key",
    "value": "secret-key-123",
    "metadata": {"description": "Test key"}
  }'

# Get credential
curl http://localhost:3000/api/vault/get/test/api_key

# List credentials
curl http://localhost:3000/api/vault/list/test

# Get stats
curl http://localhost:3000/api/vault/stats
```

### **Test Sabre**

```bash
# Check status
curl http://localhost:3000/api/sabre/status

# Search flights
curl -X POST http://localhost:3000/api/sabre/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-11-01",
    "passengers": 1
  }'
```

---

## 🔒 SECURITY BEST PRACTICES

### **DO**

✅ **Use strong encryption keys** (32 bytes minimum)  
✅ **Store keys in environment variables** (never in code)  
✅ **Use HTTPS in production**  
✅ **Rotate encryption keys periodically**  
✅ **Enable Row Level Security (RLS) in Supabase**  
✅ **Validate all inputs**  
✅ **Log security events**  
✅ **Use service role key for vault operations**  
✅ **Clear cache after credential updates**  
✅ **Backup encryption keys securely**

### **DON'T**

❌ **Never commit encryption keys to Git**  
❌ **Never log decrypted credentials**  
❌ **Never expose credentials in API responses**  
❌ **Never use weak encryption algorithms**  
❌ **Never reuse IVs or salts**  
❌ **Never store plaintext credentials**  
❌ **Never bypass authentication**  
❌ **Never use HTTP in production**

### **Key Rotation**

```javascript
// Generate new master key
const newKey = encryptionService.generateMasterKey();

// Rotate all credentials
await secureVault.rotateEncryptionKey(newKey);

// Update .env with new key
// ENCRYPTION_KEY=new-key-here

// Restart server
```

---

## 📦 INSTALLATION

### **1. Install Dependencies**

```bash
cd backend
npm install coinbase-commerce-node axios
```

### **2. Setup Environment**

```bash
# Copy example
cp .env.example .env

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env
echo "ENCRYPTION_KEY=your-generated-key" >> .env
```

### **3. Create Database Table**

Run the SQL script in Supabase SQL Editor.

### **4. Add Routes to Server**

```javascript
// backend/server.js
const vaultRoutes = require('./routes/vault-routes');
const sabreRoutes = require('./routes/sabre-routes');

app.use('/api/vault', vaultRoutes);
app.use('/api/sabre', sabreRoutes);
```

### **5. Start Server**

```bash
npm run dev
```

---

## 🚀 DEPLOYMENT

### **Environment Variables**

Add all required environment variables to your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Render**: Dashboard → Environment → Environment Variables
- **Railway**: Project → Variables

### **Database Migration**

Run the SQL script on your production Supabase instance.

### **Test Production**

```bash
# Test encryption
curl https://your-domain.com/api/vault/info

# Test Sabre
curl https://your-domain.com/api/sabre/status
```

---

## 📚 ADDITIONAL RESOURCES

- [Coinbase Commerce API Docs](https://commerce.coinbase.com/docs/)
- [Sabre Dev Studio](https://developer.sabre.com/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🆘 TROUBLESHOOTING

### **Encryption Key Not Set**

```
⚠️ ENCRYPTION_KEY not set or too short
```

**Solution**: Generate and set encryption key in `.env`

### **Supabase Table Not Found**

```
Failed to store credential: relation "secure_vault" does not exist
```

**Solution**: Run the SQL script to create the table

### **Sabre Authentication Failed**

```
Failed to authenticate with Sabre API
```

**Solution**: Check credentials in vault or environment variables

### **Decryption Failed**

```
Failed to decrypt data
```

**Solution**: Ensure ENCRYPTION_KEY hasn't changed

---

**Built by**: Mohamed Hossameldin Abdelaziz  
**Date**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
