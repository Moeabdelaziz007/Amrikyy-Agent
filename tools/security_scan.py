#!/usr/bin/env python3
# tools/security_scan.py
import re, sys, yaml, json, os
from pathlib import Path

RULES_PATH = Path(__file__).parent.parent / "security/rules.yaml"

def load_rules():
    with open(RULES_PATH, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def scan_file(path, rules):
    hits = []
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f, 1):
                for rule in rules:
                    if re.search(rule['pattern'], line, re.IGNORECASE):
                        hits.append({
                            "file": str(path),
                            "line": i,
                            "rule_id": rule['id'],
                            "severity": rule['severity'],
                            "match_preview": line.strip()[:150]
                        })
    except Exception as e:
        print(f"Could not scan {path}: {e}", file=sys.stderr)
    return hits

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <path_to_scan>", file=sys.stderr)
        sys.exit(2)
    
    scan_root = Path(sys.argv[1])
    rules = load_rules()
    all_findings = []
    
    if scan_root.is_file():
        all_findings.extend(scan_file(scan_root, rules))
    else:
        for p in scan_root.rglob('*'):
            if p.is_file() and not any(part.startswith('.') for part in p.parts):
                all_findings.extend(scan_file(p, rules))

    output = {"path_scanned": str(scan_root), "findings": all_findings}
    print(json.dumps(output, indent=2, ensure_ascii=False))
    
    if any(f['severity'] == 'critical' for f in all_findings):
        print("\nCRITICAL severity finding detected. Exiting with error.", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
