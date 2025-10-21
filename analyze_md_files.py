#!/usr/bin/env python3
"""
Analyze markdown files for duplicates, outdated content, and redundancy.
"""
import os
import hashlib
import re
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher
import json

def get_file_hash(filepath):
    """Get MD5 hash of file content."""
    try:
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None

def get_file_content(filepath):
    """Get file content as string."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except:
        return ""

def normalize_content(content):
    """Normalize content for comparison."""
    # Remove extra whitespace
    content = re.sub(r'\s+', ' ', content)
    # Remove markdown formatting
    content = re.sub(r'[#*_`\[\]()]', '', content)
    return content.lower().strip()

def calculate_similarity(content1, content2):
    """Calculate similarity ratio between two contents."""
    norm1 = normalize_content(content1)
    norm2 = normalize_content(content2)
    return SequenceMatcher(None, norm1, norm2).ratio()

def extract_metadata(filepath, content):
    """Extract metadata from markdown file."""
    lines = content.split('\n')
    metadata = {
        'path': filepath,
        'size': len(content),
        'lines': len(lines),
        'title': '',
        'headers': [],
        'has_code': '```' in content,
        'has_links': '[' in content and '](' in content,
        'word_count': len(content.split()),
        'last_modified': os.path.getmtime(filepath) if os.path.exists(filepath) else 0
    }
    
    # Extract title (first h1)
    for line in lines:
        if line.strip().startswith('# '):
            metadata['title'] = line.strip()[2:].strip()
            break
    
    # Extract all headers
    for line in lines:
        if line.strip().startswith('#'):
            metadata['headers'].append(line.strip())
    
    return metadata

def find_markdown_files(root_dir):
    """Find all markdown files."""
    md_files = []
    for root, dirs, files in os.walk(root_dir):
        # Skip certain directories
        skip_dirs = {'.git', 'node_modules', '.venv', 'venv', '__pycache__', 'dist', 'build'}
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                md_files.append(filepath)
    
    return md_files

def analyze_files(root_dir):
    """Main analysis function."""
    print("Finding markdown files...")
    md_files = find_markdown_files(root_dir)
    print(f"Found {len(md_files)} markdown files")
    
    # Collect file data
    file_data = []
    hash_map = defaultdict(list)
    
    print("Analyzing files...")
    for filepath in md_files:
        content = get_file_content(filepath)
        file_hash = get_file_hash(filepath)
        metadata = extract_metadata(filepath, content)
        
        file_data.append({
            'filepath': filepath,
            'content': content,
            'hash': file_hash,
            'metadata': metadata
        })
        
        if file_hash:
            hash_map[file_hash].append(filepath)
    
    # Find exact duplicates
    exact_duplicates = {h: files for h, files in hash_map.items() if len(files) > 1}
    
    # Find similar files (>80% similarity)
    print("Finding similar files...")
    similar_files = []
    checked_pairs = set()
    
    for i, data1 in enumerate(file_data):
        for j, data2 in enumerate(file_data[i+1:], i+1):
            pair_key = tuple(sorted([data1['filepath'], data2['filepath']]))
            if pair_key in checked_pairs:
                continue
            checked_pairs.add(pair_key)
            
            # Skip if exact duplicates
            if data1['hash'] == data2['hash']:
                continue
            
            # Skip very small files
            if data1['metadata']['size'] < 100 or data2['metadata']['size'] < 100:
                continue
            
            similarity = calculate_similarity(data1['content'], data2['content'])
            if similarity > 0.80:
                similar_files.append({
                    'file1': data1['filepath'],
                    'file2': data2['filepath'],
                    'similarity': similarity,
                    'size1': data1['metadata']['size'],
                    'size2': data2['metadata']['size']
                })
    
    # Sort similar files by similarity
    similar_files.sort(key=lambda x: x['similarity'], reverse=True)
    
    # Categorize files
    root_level_files = [f for f in file_data if os.path.dirname(f['filepath']) == root_dir]
    docs_files = [f for f in file_data if '/docs/' in f['filepath']]
    
    # Identify outdated patterns
    outdated_patterns = []
    for data in file_data:
        filepath = data['filepath']
        content = data['content'].lower()
        
        # Check for outdated indicators
        if 'maya' in content and 'amrikyy' not in content:
            outdated_patterns.append({
                'file': filepath,
                'reason': 'References old name "Maya" instead of "Amrikyy"'
            })
        
        if 'todo' in content or 'fixme' in content or 'wip' in content:
            outdated_patterns.append({
                'file': filepath,
                'reason': 'Contains TODO/FIXME/WIP markers'
            })
        
        if 'deprecated' in content:
            outdated_patterns.append({
                'file': filepath,
                'reason': 'Marked as deprecated'
            })
    
    # Generate report
    report = {
        'summary': {
            'total_files': len(md_files),
            'total_lines': sum(d['metadata']['lines'] for d in file_data),
            'total_size': sum(d['metadata']['size'] for d in file_data),
            'root_level_files': len(root_level_files),
            'docs_files': len(docs_files),
            'exact_duplicates': len(exact_duplicates),
            'similar_files': len(similar_files),
            'outdated_files': len(outdated_patterns)
        },
        'exact_duplicates': exact_duplicates,
        'similar_files': similar_files[:50],  # Top 50
        'outdated_patterns': outdated_patterns[:50],  # Top 50
        'root_level_files': [d['metadata'] for d in root_level_files],
        'largest_files': sorted([d['metadata'] for d in file_data], 
                               key=lambda x: x['size'], reverse=True)[:20]
    }
    
    return report

if __name__ == '__main__':
    root_dir = '/workspaces/Amrikyy-Agent'
    report = analyze_files(root_dir)
    
    # Save report
    with open('/workspaces/Amrikyy-Agent/md_analysis_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "="*80)
    print("MARKDOWN FILES ANALYSIS REPORT")
    print("="*80)
    print(f"\nTotal Files: {report['summary']['total_files']}")
    print(f"Total Lines: {report['summary']['total_lines']:,}")
    print(f"Total Size: {report['summary']['total_size']:,} bytes")
    print(f"Root Level Files: {report['summary']['root_level_files']}")
    print(f"Docs Directory Files: {report['summary']['docs_files']}")
    
    print(f"\n{'='*80}")
    print(f"EXACT DUPLICATES: {report['summary']['exact_duplicates']}")
    print(f"{'='*80}")
    for hash_val, files in list(report['exact_duplicates'].items())[:10]:
        print(f"\nDuplicate set ({len(files)} files):")
        for f in files:
            print(f"  - {f.replace(root_dir, '')}")
    
    print(f"\n{'='*80}")
    print(f"SIMILAR FILES (>80% similarity): {report['summary']['similar_files']}")
    print(f"{'='*80}")
    for item in report['similar_files'][:20]:
        print(f"\nSimilarity: {item['similarity']:.1%}")
        print(f"  File 1: {item['file1'].replace(root_dir, '')} ({item['size1']} bytes)")
        print(f"  File 2: {item['file2'].replace(root_dir, '')} ({item['size2']} bytes)")
    
    print(f"\n{'='*80}")
    print(f"POTENTIALLY OUTDATED FILES: {report['summary']['outdated_files']}")
    print(f"{'='*80}")
    for item in report['outdated_patterns'][:20]:
        print(f"\n{item['file'].replace(root_dir, '')}")
        print(f"  Reason: {item['reason']}")
    
    print(f"\n{'='*80}")
    print("LARGEST FILES")
    print(f"{'='*80}")
    for item in report['largest_files'][:10]:
        print(f"\n{item['path'].replace(root_dir, '')}")
        print(f"  Size: {item['size']:,} bytes, Lines: {item['lines']:,}, Words: {item['word_count']:,}")
        if item['title']:
            print(f"  Title: {item['title']}")
    
    print("\n\nFull report saved to: md_analysis_report.json")
