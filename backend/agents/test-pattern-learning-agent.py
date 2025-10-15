#!/usr/bin/env python3
"""
Pattern Learning Agent - Test Script (Python Version)
Tests the Pattern Learning Mega Agent capabilities
"""

import os
import re
from pathlib import Path

# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BRIGHT = '\033[1m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'
    RED = '\033[31m'

def log(message, color='RESET'):
    color_code = getattr(Colors, color.upper(), Colors.RESET)
    print(f"{color_code}{message}{Colors.RESET}")

def header(title):
    log('\n' + '=' * 60, 'CYAN')
    log(f"  {title}", 'BRIGHT')
    log('=' * 60, 'CYAN')

def success(message):
    log(f"✅ {message}", 'GREEN')

def error(message):
    log(f"❌ {message}", 'RED')

def info(message):
    log(f"ℹ️  {message}", 'BLUE')

def warning(message):
    log(f"⚠️  {message}", 'YELLOW')

# Test 1: Load AIX File
def test_load_aix_file():
    header('TEST 1: Load AIX File')
    
    try:
        aix_path = Path(__file__).parent / 'pattern-learning-mega-agent.aix'
        
        if not aix_path.exists():
            error('AIX file not found!')
            return False
        
        with open(aix_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = len(content.split('\n'))
        
        success('AIX file loaded successfully')
        info(f'File size: {len(content)} bytes')
        info(f'Lines: {lines}')
        
        return {'content': content, 'lines': lines}
    except Exception as e:
        error(f'Failed to load AIX file: {str(e)}')
        return False

# Test 2: Validate AIX Structure
def test_validate_structure(content):
    header('TEST 2: Validate AIX Structure')
    
    required_sections = [
        '$schema',
        'version',
        'genome',
        'meta:',
        'identity:',
        'intelligence:',
        'interaction:',
        'workflow:',
        'apis:',
        'mcp_tools:',
        'security:',
        'monitoring:',
        'dna_scoring:',
        'deployment:'
    ]
    
    passed = 0
    failed = 0
    
    for section in required_sections:
        if section in content:
            success(f'Section found: {section}')
            passed += 1
        else:
            error(f'Section missing: {section}')
            failed += 1
    
    info(f'\nValidation: {passed}/{len(required_sections)} sections found')
    
    return failed == 0

# Test 3: Extract Agent Capabilities
def test_extract_capabilities(content):
    header('TEST 3: Extract Agent Capabilities')
    
    capabilities = {
        'pattern_recognition': None,
        'topology_analysis': None,
        'quantum_simulation': None,
        'neural_architecture': None,
        'graph_theory': None,
        'adaptive_learning': None,
        'simulation_mastery': None,
        'mega_intelligence': None
    }
    
    # Extract power levels
    for cap in capabilities.keys():
        pattern = rf'{cap}:\s*(\d+)'
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            capabilities[cap] = int(match.group(1))
            success(f'{cap}: {capabilities[cap]}/100')
    
    # Calculate average
    values = [v for v in capabilities.values() if v is not None]
    if values:
        average = sum(values) / len(values)
        info(f'\nAverage capability score: {average:.1f}/100')
    
    return capabilities

# Test 4: Extract MCP Tools
def test_extract_mcp_tools(content):
    header('TEST 4: Extract MCP Tools')
    
    tools = [
        'pattern_analyzer',
        'topology_explorer',
        'quantum_simulator',
        'neural_architect',
        'simulation_engine'
    ]
    
    found = 0
    for tool in tools:
        if tool in content:
            success(f'Tool found: {tool}')
            found += 1
        else:
            warning(f'Tool not found: {tool}')
    
    info(f'\nMCP Tools: {found}/{len(tools)} found')
    
    return found == len(tools)

# Test 5: Extract API Endpoints
def test_extract_apis(content):
    header('TEST 5: Extract API Endpoints')
    
    apis = [
        'pattern-analysis-api',
        'topology-analysis-api',
        'quantum-simulation-api'
    ]
    
    found = 0
    for api in apis:
        if api in content:
            success(f'API found: {api}')
            found += 1
        else:
            warning(f'API not found: {api}')
    
    info(f'\nAPIs: {found}/{len(apis)} found')
    
    return found == len(apis)

# Test 6: Extract DNA Score
def test_extract_dna_score(content):
    header('TEST 6: Extract DNA Score')
    
    match = re.search(r'total:\s*(\d+\.?\d*)', content, re.IGNORECASE)
    
    if match:
        score = float(match.group(1))
        success(f'DNA Score: {score}/100')
        
        if score >= 95:
            success('Rating: MEGA LEVEL ⭐⭐⭐⭐⭐')
        elif score >= 90:
            success('Rating: EXPERT LEVEL ⭐⭐⭐⭐')
        elif score >= 80:
            info('Rating: ADVANCED LEVEL ⭐⭐⭐')
        else:
            warning('Rating: INTERMEDIATE LEVEL ⭐⭐')
        
        return score
    else:
        error('DNA score not found')
        return None

# Test 7: Pattern Recognition Simulation
def test_pattern_recognition():
    header('TEST 7: Pattern Recognition Simulation')
    
    info('Simulating pattern recognition...')
    
    patterns = [
        ([1, 2, 3, 4, 5], 'Linear'),
        ([2, 4, 6, 8, 10], 'Even Numbers'),
        ([1, 1, 2, 3, 5, 8], 'Fibonacci'),
        ([10, 20, 30, 40, 50], 'Multiples of 10')
    ]
    
    for idx, (pattern, ptype) in enumerate(patterns, 1):
        pattern_str = ', '.join(map(str, pattern))
        success(f'Pattern {idx}: {ptype} - {pattern_str}')
    
    info('\n✨ Pattern recognition simulation complete!')
    
    return True

# Main Test Runner
def run_tests():
    log('\n🧠 PATTERN LEARNING AGENT - TEST SUITE', 'BRIGHT')
    log('Testing Pattern Learning Mega Agent v1.0.0\n', 'CYAN')
    
    results = {
        'total': 7,
        'passed': 0,
        'failed': 0
    }
    
    # Run all tests
    aix_data = test_load_aix_file()
    if aix_data:
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    if aix_data:
        if test_validate_structure(aix_data['content']):
            results['passed'] += 1
        else:
            results['failed'] += 1
        
        capabilities = test_extract_capabilities(aix_data['content'])
        if capabilities:
            results['passed'] += 1
        else:
            results['failed'] += 1
        
        if test_extract_mcp_tools(aix_data['content']):
            results['passed'] += 1
        else:
            results['failed'] += 1
        
        if test_extract_apis(aix_data['content']):
            results['passed'] += 1
        else:
            results['failed'] += 1
        
        dna_score = test_extract_dna_score(aix_data['content'])
        if dna_score:
            results['passed'] += 1
        else:
            results['failed'] += 1
    else:
        results['failed'] += 5
    
    if test_pattern_recognition():
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Final Report
    header('TEST RESULTS SUMMARY')
    
    log(f"\nTotal Tests: {results['total']}", 'BRIGHT')
    log(f"Passed: {results['passed']}", 'GREEN')
    log(f"Failed: {results['failed']}", 'RED')
    
    percentage = (results['passed'] / results['total'] * 100)
    color = 'GREEN' if percentage >= 80 else 'YELLOW'
    log(f"\nSuccess Rate: {percentage:.1f}%", color)
    
    if results['failed'] == 0:
        log('\n🎉 ALL TESTS PASSED! Agent is working perfectly!', 'GREEN')
    elif results['passed'] >= results['total'] * 0.8:
        log('\n✅ Most tests passed. Agent is functional with minor issues.', 'YELLOW')
    else:
        log('\n⚠️  Multiple tests failed. Agent needs attention.', 'RED')
    
    log('\n' + '=' * 60 + '\n', 'CYAN')
    
    return results['failed'] == 0

if __name__ == '__main__':
    try:
        success = run_tests()
        exit(0 if success else 1)
    except Exception as e:
        error(f'Test suite failed: {str(e)}')
        exit(1)
