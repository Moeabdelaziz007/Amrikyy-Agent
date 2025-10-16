#!/usr/bin/env node

/**
 * Kody Agent Integration Test
 * Tests the complete Kody data analysis agent functionality
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

// Load environment variables
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');

// Import Kody's tool
const { executeNotebookCode } = require('./src/tools');

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function header(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(message, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

/**
 * Test 1: Basic Python Execution
 */
async function testBasicPythonExecution() {
    header('Test 1: Basic Python Execution');
    
    const testCode = `
# Basic Python test
print("Hello from Kody!")
print("Python is working correctly")

# Simple calculations
result = 42 + 8
print(f"42 + 8 = {result}")

# List operations
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(f"Original: {numbers}")
print(f"Squared: {squared}")

# Return result
{"status": "success", "calculation": result, "squared_numbers": squared}
`;
    
    try {
        info('Executing basic Python code...');
        
        const result = await executeNotebookCode.execute({
            code: testCode,
            timeout: 30,
            save_outputs: false
        });
        
        if (result.success) {
            success('Basic Python execution test passed');
            log(`Execution time: ${result.executionTime}ms`, 'blue');
            
            if (result.result && result.result.outputs) {
                log(`Outputs received: ${result.result.outputs.length}`, 'blue');
                
                // Show text outputs
                const textOutputs = result.result.outputs.filter(o => o.type === 'stream');
                if (textOutputs.length > 0) {
                    log('\nPython Output:', 'magenta');
                    textOutputs.forEach(output => {
                        if (output.text) {
                            log(output.text.trim(), 'blue');
                        }
                    });
                }
            }
            
            return true;
        } else {
            error(`Basic Python execution failed: ${result.error}`);
            return false;
        }
        
    } catch (err) {
        error(`Basic Python execution error: ${err.message}`);
        return false;
    }
}

/**
 * Test 2: Pandas Data Analysis
 */
async function testPandasAnalysis() {
    header('Test 2: Pandas Data Analysis');
    
    const testCode = `
import pandas as pd
import numpy as np

# Create sample travel data
data = {
    'destination': ['Paris', 'Tokyo', 'New York', 'London', 'Dubai'],
    'duration_days': [7, 10, 5, 6, 8],
    'budget_usd': [2500, 3000, 2000, 2200, 2800],
    'rating': [4.8, 4.9, 4.5, 4.7, 4.6]
}

df = pd.DataFrame(data)

print("=== Travel Data Analysis ===")
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

print("\\n=== Basic Statistics ===")
print(df.describe())

print("\\n=== Budget Analysis ===")
avg_budget = df['budget_usd'].mean()
max_budget = df['budget_usd'].max()
min_budget = df['budget_usd'].min()

print("Average budget: $" + str(round(avg_budget, 2)))
print("Highest budget: $" + str(max_budget))
print("Lowest budget: $" + str(min_budget))

# Find best value destinations (high rating, low cost)
df['value_score'] = df['rating'] / (df['budget_usd'] / 1000)
best_value = df.nlargest(3, 'value_score')[['destination', 'value_score']]

print("\\n=== Best Value Destinations ===")
print(best_value)

# Return analysis results
{
    "total_destinations": len(df),
    "average_budget": float(avg_budget),
    "budget_range": {"min": int(min_budget), "max": int(max_budget)},
    "best_value_destinations": best_value.to_dict('records')
}
`;
    
    try {
        info('Executing pandas data analysis...');
        
        const result = await executeNotebookCode.execute({
            code: testCode,
            libraries: ['pandas', 'numpy'],
            timeout: 45,
            save_outputs: true
        });
        
        if (result.success) {
            success('Pandas analysis test passed');
            log(`Execution time: ${result.executionTime}ms`, 'blue');
            
            // Show analysis results
            if (result.result && result.result.outputs) {
                const resultOutputs = result.result.outputs.filter(o => o.type === 'result');
                if (resultOutputs.length > 0) {
                    const analysisResult = resultOutputs[0].data;
                    log('\nAnalysis Results:', 'magenta');
                    log(JSON.stringify(analysisResult, null, 2), 'blue');
                }
            }
            
            return true;
        } else {
            error(`Pandas analysis failed: ${result.error}`);
            return false;
        }
        
    } catch (err) {
        error(`Pandas analysis error: ${err.message}`);
        return false;
    }
}

/**
 * Test 3: Data Visualization
 */
async function testDataVisualization() {
    header('Test 3: Data Visualization');
    
    const testCode = `
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Create sample data for visualization
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
bookings = [120, 135, 150, 165, 180, 200]
revenue = [24000, 27000, 30000, 33000, 36000, 40000]

# Create a simple bar chart
plt.figure(figsize=(10, 6))
plt.bar(months, bookings, color='skyblue', alpha=0.7)
plt.title('Monthly Travel Bookings', fontsize=16, fontweight='bold')
plt.xlabel('Month', fontsize=12)
plt.ylabel('Number of Bookings', fontsize=12)
plt.grid(axis='y', alpha=0.3)

# Add value labels on bars
for i, v in enumerate(bookings):
    plt.text(i, v + 2, str(v), ha='center', va='bottom', fontweight='bold')

plt.tight_layout()

# Save the plot
plot_filename = 'monthly_bookings_chart.png'
plt.savefig(plot_filename, dpi=150, bbox_inches='tight')
plt.close()

print("Chart saved as:", plot_filename)

# Create a line chart for revenue
plt.figure(figsize=(10, 6))
plt.plot(months, revenue, marker='o', linewidth=2, markersize=8, color='green')
plt.title('Monthly Revenue Trend', fontsize=16, fontweight='bold')
plt.xlabel('Month', fontsize=12)
plt.ylabel('Revenue ($)', fontsize=12)
plt.grid(True, alpha=0.3)

# Add value labels
for i, v in enumerate(revenue):
    plt.text(i, v + 500, '$' + str(v), ha='center', va='bottom', fontweight='bold')

plt.tight_layout()

# Save the second plot
revenue_plot_filename = 'revenue_trend_chart.png'
plt.savefig(revenue_plot_filename, dpi=150, bbox_inches='tight')
plt.close()

print("Revenue chart saved as:", revenue_plot_filename)

# Return visualization info
{
    "charts_created": 2,
    "chart_files": [plot_filename, revenue_plot_filename],
    "data_points": len(months),
    "total_revenue": sum(revenue),
    "average_monthly_bookings": sum(bookings) / len(bookings)
}
`;
    
    try {
        info('Executing data visualization test...');
        
        const result = await executeNotebookCode.execute({
            code: testCode,
            libraries: ['matplotlib', 'numpy', 'pandas'],
            timeout: 60,
            save_outputs: true
        });
        
        if (result.success) {
            success('Data visualization test passed');
            log(`Execution time: ${result.executionTime}ms`, 'blue');
            
            // Check if charts were created
            if (result.result && result.result.savedFiles) {
                log(`Files saved: ${result.result.savedFiles.length}`, 'blue');
                result.result.savedFiles.forEach(file => {
                    log(`  - ${file}`, 'blue');
                });
            }
            
            return true;
        } else {
            error(`Data visualization failed: ${result.error}`);
            return false;
        }
        
    } catch (err) {
        error(`Data visualization error: ${err.message}`);
        return false;
    }
}

/**
 * Test 4: Error Handling
 */
async function testErrorHandling() {
    header('Test 4: Error Handling');
    
    const testCode = `
# This code will intentionally cause an error
print("About to cause an error...")

# Try to access undefined variable
result = undefined_variable + 42

print("This line should not execute")
`;
    
    try {
        info('Testing error handling with intentional error...');
        
        const result = await executeNotebookCode.execute({
            code: testCode,
            timeout: 30,
            save_outputs: false
        });
        
        if (!result.success) {
            success('Error handling test passed - error was properly caught');
            log(`Error message: ${result.error}`, 'yellow');
            return true;
        } else {
            error('Error handling test failed - error was not properly caught');
            return false;
        }
        
    } catch (err) {
        error(`Error handling test error: ${err.message}`);
        return false;
    }
}

/**
 * Test 5: Security Validation
 */
async function testSecurityValidation() {
    header('Test 5: Security Validation');
    
    const dangerousCode = `
import os
print("This should be blocked")
`;
    
    try {
        info('Testing security validation with dangerous import...');
        
        const result = await executeNotebookCode.execute({
            code: dangerousCode,
            timeout: 30,
            save_outputs: false
        });
        
        if (!result.success) {
            success('Security validation test passed - dangerous code was blocked');
            log(`Blocked reason: ${result.error}`, 'yellow');
            return true;
        } else {
            error('Security validation test failed - dangerous code was allowed');
            return false;
        }
        
    } catch (err) {
        error(`Security validation test error: ${err.message}`);
        return false;
    }
}

/**
 * Create sample CSV file for testing
 */
async function createSampleCSV() {
    const csvContent = `destination,duration_days,budget_usd,rating,season
Paris,7,2500,4.8,Spring
Tokyo,10,3000,4.9,Fall
New York,5,2000,4.5,Winter
London,6,2200,4.7,Summer
Dubai,8,2800,4.6,Winter
Barcelona,6,1800,4.4,Summer
Rome,7,2100,4.6,Spring
Amsterdam,5,1900,4.3,Fall
Prague,4,1500,4.2,Winter
Istanbul,6,1600,4.5,Spring`;

    const csvPath = path.join(__dirname, 'data/kody/datasets/sample_travel_data.csv');
    await fs.writeFile(csvPath, csvContent);
    log(`Sample CSV created: ${csvPath}`, 'blue');
    return csvPath;
}

/**
 * Test 6: CSV Data Analysis
 */
async function testCSVAnalysis() {
    header('Test 6: CSV Data Analysis');
    
    // Create sample CSV first
    const csvPath = await createSampleCSV();
    
    const testCode = `
import pandas as pd
import matplotlib.pyplot as plt

# Read the CSV file
df = pd.read_csv('sample_travel_data.csv')

print("=== CSV Data Analysis ===")
print("Dataset loaded:", df.shape[0], "rows,", df.shape[1], "columns")
print("Columns:", list(df.columns))

print("\n=== Data Preview ===")
print(df.head())

print("\n=== Season Analysis ===")
season_stats = df.groupby('season').agg({
    'budget_usd': ['mean', 'count'],
    'rating': 'mean',
    'duration_days': 'mean'
}).round(2)

print(season_stats)

# Create season comparison chart
plt.figure(figsize=(12, 8))

# Budget by season
plt.subplot(2, 2, 1)
season_budget = df.groupby('season')['budget_usd'].mean()
season_budget.plot(kind='bar', color='lightblue')
plt.title('Average Budget by Season')
plt.ylabel('Budget (USD)')
plt.xticks(rotation=45)

# Rating by season
plt.subplot(2, 2, 2)
season_rating = df.groupby('season')['rating'].mean()
season_rating.plot(kind='bar', color='lightgreen')
plt.title('Average Rating by Season')
plt.ylabel('Rating')
plt.xticks(rotation=45)

# Duration distribution
plt.subplot(2, 2, 3)
df['duration_days'].hist(bins=8, color='orange', alpha=0.7)
plt.title('Duration Distribution')
plt.xlabel('Days')
plt.ylabel('Frequency')

# Budget vs Rating scatter
plt.subplot(2, 2, 4)
plt.scatter(df['budget_usd'], df['rating'], alpha=0.6, color='red')
plt.xlabel('Budget (USD)')
plt.ylabel('Rating')
plt.title('Budget vs Rating')

plt.tight_layout()
plt.savefig('travel_analysis_dashboard.png', dpi=150, bbox_inches='tight')
plt.close()

print("\\nDashboard saved as: travel_analysis_dashboard.png")

# Return comprehensive analysis
{
    "total_destinations": len(df),
    "average_budget": float(df['budget_usd'].mean()),
    "average_rating": float(df['rating'].mean()),
    "average_duration": float(df['duration_days'].mean()),
    "season_analysis": season_stats.to_dict(),
    "dashboard_created": True
}
`;
    
    try {
        info('Executing CSV analysis test...');
        
        const result = await executeNotebookCode.execute({
            code: testCode,
            libraries: ['pandas', 'matplotlib'],
            timeout: 90,
            save_outputs: true
        });
        
        if (result.success) {
            success('CSV analysis test passed');
            log(`Execution time: ${result.executionTime}ms`, 'blue');
            
            // Show analysis results
            if (result.result && result.result.outputs) {
                const resultOutputs = result.result.outputs.filter(o => o.type === 'result');
                if (resultOutputs.length > 0) {
                    const analysisResult = resultOutputs[0].data;
                    log('\nCSV Analysis Results:', 'magenta');
                    log(JSON.stringify(analysisResult, null, 2), 'blue');
                }
            }
            
            return true;
        } else {
            error(`CSV analysis failed: ${result.error}`);
            return false;
        }
        
    } catch (err) {
        error(`CSV analysis error: ${err.message}`);
        return false;
    }
}

/**
 * Main test runner
 */
async function main() {
    header('🚀 Kody Agent Integration Test Suite');
    
    log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'blue');
    log(`Timestamp: ${new Date().toISOString()}`, 'blue');
    log(`Python Environment: ${path.join(__dirname, 'kody_env')}`, 'blue');
    
    const tests = [
        { name: 'Basic Python Execution', fn: testBasicPythonExecution },
        { name: 'Pandas Data Analysis', fn: testPandasAnalysis },
        { name: 'Data Visualization', fn: testDataVisualization },
        { name: 'Error Handling', fn: testErrorHandling },
        { name: 'Security Validation', fn: testSecurityValidation },
        { name: 'CSV Data Analysis', fn: testCSVAnalysis }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
            }
        } catch (err) {
            error(`Test "${test.name}" crashed: ${err.message}`);
        }
    }
    
    // Final summary
    header('📊 Test Results Summary');
    
    if (passedTests === totalTests) {
        success(`🎉 All ${totalTests} tests passed! Kody is ready for production.`);
        log('\nNext steps:', 'blue');
        log('1. Kody agent is fully functional', 'blue');
        log('2. Ready to integrate with Maya Travel Agent system', 'blue');
        log('3. Can handle complex data analysis tasks', 'blue');
        log('4. Security measures are working correctly', 'blue');
    } else {
        error(`❌ ${totalTests - passedTests}/${totalTests} tests failed.`);
        log('\nTroubleshooting:', 'yellow');
        log('1. Check Python environment setup', 'yellow');
        log('2. Verify Jupyter installation', 'yellow');
        log('3. Check file permissions', 'yellow');
        log('4. Review error messages above', 'yellow');
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    main().catch(err => {
        error(`Test suite failed: ${err.message}`);
        process.exit(1);
    });
}

module.exports = {
    testBasicPythonExecution,
    testPandasAnalysis,
    testDataVisualization,
    testErrorHandling,
    testSecurityValidation,
    testCSVAnalysis
};
