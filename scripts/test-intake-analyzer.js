#!/usr/bin/env node

/**
 * Test Script for Intake Analyzer
 * Tests the Intake Analyzer with sample messages
 */

const IntakeAnalyzer = require('../backend/services/automation/IntakeAnalyzer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Sample test messages
const testMessages = [
  {
    text: 'أريد السفر إلى تركيا لمدة 7 أيام مع عائلتي (4 أشخاص) بميزانية 5000 دولار',
    expected: {
      destination: 'Turkey',
      travelers: 4,
      budget: 5000,
      tripDuration: 7
    }
  },
  {
    text: 'I want to visit Paris next month for 5 days, budget around $3000 for 2 people',
    expected: {
      destination: 'Paris',
      travelers: 2,
      budget: 3000,
      tripDuration: 5
    }
  },
  {
    text: 'Looking for a luxury beach vacation in Maldives, 2 weeks, budget no limit',
    expected: {
      destination: 'Maldives',
      tripDuration: 14,
      preferences: ['luxury', 'beach']
    }
  },
  {
    text: 'Need urgent flight from NYC to London, leaving tomorrow, returning in 3 days',
    expected: {
      origin: 'NYC',
      destination: 'London',
      urgency: 'high',
      tripDuration: 3
    }
  },
  {
    text: 'Family trip to Dubai, 4 adults and 2 kids, halal food important, budget $8000',
    expected: {
      destination: 'Dubai',
      travelers: 6,
      budget: 8000,
      preferences: ['family-friendly', 'halal']
    }
  }
];

async function runTests() {
  console.log('🧪 Testing Intake Analyzer\n');
  console.log('=' .repeat(80));

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    console.log(`\n📝 Test ${i + 1}/${testMessages.length}`);
    console.log(`Input: "${test.text}"`);
    console.log('-'.repeat(80));

    try {
      // Create test message in database
      const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert({
          user_id: 'test-user',
          text: test.text,
          platform: 'test',
          processed: false
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert test message: ${insertError.message}`);
      }

      // Process message
      const startTime = Date.now();
      const result = await IntakeAnalyzer.processMessage(message);
      const duration = Date.now() - startTime;

      console.log(`✅ Processed in ${duration}ms`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log('\nExtracted Data:');
      console.log(JSON.stringify(result.extraction, null, 2));

      // Validate against expected
      let testPassed = true;
      const errors = [];

      for (const [key, expectedValue] of Object.entries(test.expected)) {
        const actualValue = result.extraction[key];

        if (Array.isArray(expectedValue)) {
          // Check if all expected values are present
          const missing = expectedValue.filter(v => !actualValue?.includes(v));
          if (missing.length > 0) {
            testPassed = false;
            errors.push(`Missing ${key}: ${missing.join(', ')}`);
          }
        } else if (actualValue !== expectedValue) {
          // Allow some flexibility for numbers and strings
          if (typeof expectedValue === 'number' && Math.abs(actualValue - expectedValue) <= 1) {
            // Close enough for numbers
            continue;
          }
          if (typeof expectedValue === 'string' && actualValue?.toLowerCase().includes(expectedValue.toLowerCase())) {
            // Partial match for strings
            continue;
          }
          testPassed = false;
          errors.push(`${key}: expected "${expectedValue}", got "${actualValue}"`);
        }
      }

      if (testPassed) {
        console.log('\n✅ Test PASSED');
        passed++;
      } else {
        console.log('\n❌ Test FAILED');
        console.log('Errors:');
        errors.forEach(err => console.log(`  - ${err}`));
        failed++;
      }

      // Clean up test data
      await supabase.from('leads').delete().eq('message_id', message.id);
      await supabase.from('messages').delete().eq('id', message.id);

    } catch (error) {
      console.log(`\n❌ Test FAILED with error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   Total: ${testMessages.length}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${Math.round((passed / testMessages.length) * 100)}%`);

  // Get overall statistics
  console.log('\n📈 Overall Statistics:');
  const stats = await IntakeAnalyzer.getStatistics();
  console.log(JSON.stringify(stats, null, 2));

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
