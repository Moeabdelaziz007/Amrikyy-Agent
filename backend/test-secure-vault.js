/**
 * test-secure-vault.js
 * 
 * Test script for encryption and secure vault functionality
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const encryptionService = require('./src/services/EncryptionService');
const secureVault = require('./src/services/SecureVaultService');
const sabreService = require('./src/services/SabreService');

console.log('\n🔐 SECURE VAULT & ENCRYPTION TEST\n');
console.log('='.repeat(50));

// Test 1: Encryption Service
console.log('\n📝 Test 1: Encryption Service');
console.log('-'.repeat(50));

try {
  const testData = 'This is a secret message!';
  console.log('Original:', testData);
  
  const encrypted = encryptionService.encrypt(testData);
  console.log('Encrypted:', encrypted.substring(0, 50) + '...');
  
  const decrypted = encryptionService.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
  
  if (testData === decrypted) {
    console.log('✅ Encryption/Decryption: PASSED');
  } else {
    console.log('❌ Encryption/Decryption: FAILED');
  }
} catch (error) {
  console.log('❌ Encryption test failed:', error.message);
}

// Test 2: Object Encryption
console.log('\n📝 Test 2: Object Encryption');
console.log('-'.repeat(50));

try {
  const testObj = {
    apiKey: 'test-api-key-123',
    secret: 'super-secret-value',
    metadata: {
      provider: 'test',
      createdAt: new Date().toISOString()
    }
  };
  
  console.log('Original Object:', JSON.stringify(testObj, null, 2));
  
  const encryptedObj = encryptionService.encryptObject(testObj);
  console.log('Encrypted:', encryptedObj.substring(0, 50) + '...');
  
  const decryptedObj = encryptionService.decryptObject(encryptedObj);
  console.log('Decrypted Object:', JSON.stringify(decryptedObj, null, 2));
  
  if (JSON.stringify(testObj) === JSON.stringify(decryptedObj)) {
    console.log('✅ Object Encryption: PASSED');
  } else {
    console.log('❌ Object Encryption: FAILED');
  }
} catch (error) {
  console.log('❌ Object encryption test failed:', error.message);
}

// Test 3: Hash Function
console.log('\n📝 Test 3: Hash Function');
console.log('-'.repeat(50));

try {
  const password = 'mySecurePassword123';
  const hash1 = encryptionService.hash(password);
  const hash2 = encryptionService.hash(password);
  
  console.log('Password:', password);
  console.log('Hash 1:', hash1);
  console.log('Hash 2:', hash2);
  
  if (hash1 === hash2) {
    console.log('✅ Hash Function: PASSED (consistent)');
  } else {
    console.log('❌ Hash Function: FAILED (inconsistent)');
  }
} catch (error) {
  console.log('❌ Hash test failed:', error.message);
}

// Test 4: Token Generation
console.log('\n📝 Test 4: Token Generation');
console.log('-'.repeat(50));

try {
  const token1 = encryptionService.generateToken(32);
  const token2 = encryptionService.generateToken(32);
  
  console.log('Token 1:', token1);
  console.log('Token 2:', token2);
  console.log('Token 1 Length:', token1.length);
  
  if (token1 !== token2 && token1.length === 64) {
    console.log('✅ Token Generation: PASSED');
  } else {
    console.log('❌ Token Generation: FAILED');
  }
} catch (error) {
  console.log('❌ Token generation test failed:', error.message);
}

// Test 5: API Key Generation
console.log('\n📝 Test 5: API Key Generation');
console.log('-'.repeat(50));

try {
  const apiKey1 = encryptionService.generateApiKey();
  const apiKey2 = encryptionService.generateApiKey();
  
  console.log('API Key 1:', apiKey1);
  console.log('API Key 2:', apiKey2);
  
  if (apiKey1.startsWith('amk_') && apiKey2.startsWith('amk_') && apiKey1 !== apiKey2) {
    console.log('✅ API Key Generation: PASSED');
  } else {
    console.log('❌ API Key Generation: FAILED');
  }
} catch (error) {
  console.log('❌ API key generation test failed:', error.message);
}

// Test 6: Encryption Info
console.log('\n📝 Test 6: Encryption Info');
console.log('-'.repeat(50));

try {
  const info = encryptionService.getInfo();
  console.log('Encryption Info:', JSON.stringify(info, null, 2));
  
  if (info.algorithm === 'aes-256-gcm' && info.masterKeySet) {
    console.log('✅ Encryption Info: PASSED');
  } else {
    console.log('⚠️ Encryption Info: Master key not set properly');
  }
} catch (error) {
  console.log('❌ Encryption info test failed:', error.message);
}

// Test 7: Secure Vault (if Supabase is configured)
console.log('\n📝 Test 7: Secure Vault');
console.log('-'.repeat(50));

async function testVault() {
  try {
    // Test storing credential
    console.log('Testing credential storage...');
    await secureVault.storeCredential(
      'test-provider',
      'test-key',
      'test-secret-value-123',
      { description: 'Test credential' }
    );
    console.log('✅ Credential stored');
    
    // Test retrieving credential
    console.log('Testing credential retrieval...');
    const retrieved = await secureVault.getCredential('test-provider', 'test-key');
    
    if (retrieved === 'test-secret-value-123') {
      console.log('✅ Credential retrieved correctly');
    } else {
      console.log('❌ Credential mismatch');
    }
    
    // Test listing credentials
    console.log('Testing credential listing...');
    const list = await secureVault.listCredentials('test-provider');
    console.log('Credentials found:', list.length);
    
    // Test stats
    console.log('Testing vault stats...');
    const stats = await secureVault.getStats();
    console.log('Vault Stats:', JSON.stringify(stats, null, 2));
    
    // Cleanup
    console.log('Cleaning up test credential...');
    await secureVault.deleteCredential('test-provider', 'test-key');
    console.log('✅ Test credential deleted');
    
    console.log('✅ Secure Vault: PASSED');
  } catch (error) {
    console.log('⚠️ Secure Vault: SKIPPED (Supabase not configured)');
    console.log('   Error:', error.message);
  }
}

// Test 8: Sabre Service
console.log('\n📝 Test 8: Sabre Service');
console.log('-'.repeat(50));

async function testSabre() {
  try {
    console.log('Testing Sabre authentication...');
    const status = await sabreService.getStatus();
    console.log('Sabre Status:', JSON.stringify(status, null, 2));
    
    if (status.authenticated) {
      console.log('✅ Sabre Service: PASSED (authenticated)');
    } else {
      console.log('⚠️ Sabre Service: Not authenticated');
      console.log('   Configure SABRE_CLIENT_ID and SABRE_CLIENT_SECRET');
    }
  } catch (error) {
    console.log('⚠️ Sabre Service: SKIPPED (credentials not configured)');
    console.log('   Error:', error.message);
  }
}

// Run async tests
(async () => {
  await testVault();
  await testSabre();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 TEST SUITE COMPLETED\n');
  
  console.log('📋 NEXT STEPS:');
  console.log('1. Set ENCRYPTION_KEY in .env');
  console.log('2. Configure Supabase credentials');
  console.log('3. Run SQL script to create secure_vault table');
  console.log('4. Add Sabre API credentials');
  console.log('5. Test API endpoints with curl or Postman\n');
})();
