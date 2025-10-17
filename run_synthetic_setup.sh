#!/bin/bash
#
# AMRIKYY AI Solutions - SYNTHETIC Environment Setup Script
# هذا السكربت يقوم بإنشاء جميع الملفات والهياكل اللازمة لتشغيل
# خط أنابيب التحويل من AIX إلى Gemini بشكل محلي.
#

echo "==> [1/4] Creating project directory structure..."
mkdir -p .gemini/agents
mkdir -p .gemini
mkdir -p tools
mkdir -p schemas
mkdir -p tests
mkdir -p .github/workflows
mkdir -p security
mkdir -p examples/prompts
mkdir -p "examples/repos/python-monolith/src"
mkdir -p benchmark
mkdir -p out/patches

echo "==> [2/4] Generating all 15 synthetic artifact files..."

# --- 1) .gemini/agents/SUPERPOWER.aix ---
cat <<'EOF' > ./.gemini/agents/SUPERPOWER.aix
# SYNTHETIC — SUPERPOWER.aix
id: amrikyy-superpower-v1
name: AMRIKYY SUPERPOWER
description: >
  Agent for triage → patch generation → security scanning. Designed for Gemini integration.
model: gemini-2.5-pro
context_window: 32768
require_user_approval_for_write: true
entrypoint_prompt: |
  SYSTEM:
  You are AMRIKYY-SUPERPOWER agent. Tasks: code triage, generate minimal patches with tests, generate CI snippets. Always ask for explicit approval before write operations. Redact any secrets.
modes:
  - id: triage
    name: Triage Mode
    description: Detect hotspots, return JSON list of {path, line, severity, confidence, explanation}
  - id: patch
    name: Patch Mode
    description: Generate minimal atomic patch + tests, with git sequence instructions
  - id: explain
    name: Explain Mode
    description: Human readable explanation of root cause and suggested risk score
policies:
  max_patch_lines: 40
  require_approval_for_merge: true
metadata:
  owner: "AMRIKYY AI Solutions"
  contact: "REDACTED_BY_POLICY"
EOF
echo "  [+] Created ./.gemini/agents/SUPERPOWER.aix"

# --- 2) .gemini/GEMINI.md ---
cat <<'EOF' > ./.gemini/GEMINI.md
# GEMINI Integration notes (SYNTHETIC)
Agent: AMRIKYY SUPERPOWER

Run example:
```bash
gemini agent run --agent ./out/agent_config.json --mode triage --input ./examples/repos/python-monolith.tar.gz
```
Notes:

- gemini_cli_version: 0.0.0-SYNTHETIC (replace with your actual CLI).
- Agent config should match schemas/gemini_agent.schema.json.
EOF
echo "  [+] Created ./.gemini/GEMINI.md"

# --- 3) schemas/gemini_agent.schema.json ---
cat <<'EOF' > ./schemas/gemini_agent.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Gemini Agent Config",
  "type": "object",
  "required": ["id","name","model","context_window","entrypoint_prompt","modes","require_user_approval_for_write"],
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "description": {"type": "string"},
    "model": {"type": "string"},
    "context_window": {"type": "integer", "minimum": 1024},
    "require_user_approval_for_write": {"type": "boolean"},
    "entrypoint_prompt": {"type": "string"},
    "modes": {
      "type": "array",
      "items": {
        "type":"object",
        "required":["id","name","description"],
        "properties":{
          "id":{"type":"string"},
          "name":{"type":"string"},
          "description":{"type":"string"},
          "schema":{"type":"object"}
        }
      }
    },
    "policies": {"type":"object"},
    "metadata": {"type":"object"}
  },
  "additionalProperties": false
}
EOF
echo "  [+] Created ./schemas/gemini_agent.schema.json"


# --- 4) tools/aix_to_gemini.py ---
cat <<'EOF' > ./tools/aix_to_gemini.py
#!/usr/bin/env python3
# tools/aix_to_gemini.py
"""
AIX -> Gemini converter:
- Input: aix-convert.js JSON output OR SYNTHETIC .aix parsed JSON
- Validates against gemini_agent.schema.json
- Applies mappings, fills defaults, redacts secrets
"""
import json, sys, re, os, yaml
from jsonschema import validate, ValidationError

SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "..", "schemas", "gemini_agent.schema.json")
# A more robust regex to avoid catastrophic backtracking on large strings
REDACT_REGEX = re.compile(r"(?:api[_-]?key|secret|token|password)[\"']?\s*[:=]\s*[\"']?([A-Za-z0-9_\-=.]{8,})", re.IGNORECASE)

def redact_values(obj):
    if isinstance(obj, dict):
        return {k: "REDACTED_BY_POLICY" if isinstance(v, str) and re.search(r"key|secret|token|password", k, re.IGNORECASE) else redact_values(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact_values(x) for x in obj]
    if isinstance(obj, str):
        return REDACT_REGEX.sub(r"REDACTED_BY_POLICY", obj)
    return obj

def map_fields(aix):
    # Basic mapping — extend as needed
    agent = {}
    agent['id'] = aix.get('id') or aix.get('name','synthetic-id').lower().replace(' ', '-')
    agent['name'] = aix.get('name','AMRIKYY-SUPERPOWER')
    agent['description'] = aix.get('description','')
    agent['model'] = aix.get('model','gemini-2.5-pro')
    agent['context_window'] = int(aix.get('context_window', 32768))
    agent['require_user_approval_for_write'] = bool(aix.get('require_user_approval_for_write', True))
    agent['entrypoint_prompt'] = aix.get('entrypoint_prompt','').strip()
    agent['modes'] = aix.get('modes',[])
    agent['policies'] = aix.get('policies',{})
    agent['metadata'] = aix.get('metadata',{})
    return agent

def read_input_data(filepath):
    if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        print(f"Warning: Input file '{filepath}' is missing or empty. Using a default structure.", file=sys.stderr)
        return {"name": "synthetic-placeholder"}

    with open(filepath, 'r', encoding='utf-8') as f:
        if filepath.endswith('.json'):
            return json.load(f)
        elif filepath.endswith('.aix') or filepath.endswith('.yaml'):
            return yaml.safe_load(f)
    raise ValueError("Unsupported input file format. Use .json or .aix/.yaml")


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <in_aix_file.[json|aix]> <out_agent_config.json>", file=sys.stderr)
        sys.exit(2)
    
    inpath, outpath = sys.argv[1], sys.argv[2]
    
    try:
        data = read_input_data(inpath)
    except Exception as e:
        print(f"Error reading input file: {e}", file=sys.stderr)
        sys.exit(1)

    if 'id' not in data and 'name' not in data and 'aix' in data:
        data = data['aix']

    data = redact_values(data)
    agent = map_fields(data)
    
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    
    try:
        validate(instance=agent, schema=schema)
    except ValidationError as e:
        print(f"VALIDATION_ERROR: {e.message} on instance['{'/'.join(map(str, e.path))}']", file=sys.stderr)
        invalid_path = outpath + ".invalid.json"
        with open(invalid_path, "w", encoding='utf-8') as f:
            json.dump(agent, f, indent=2, ensure_ascii=False)
        print(f"Debug output saved to {invalid_path}", file=sys.stderr)
        sys.exit(1)
        
    with open(outpath,'w', encoding='utf-8') as f:
        json.dump(agent, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully converted '{inpath}' to '{outpath}'")

if __name__ == "__main__":
    main()
EOF
echo "  [+] Created ./tools/aix_to_gemini.py"

# --- 5) tests/test_converter.py ---
cat <<'EOF' > ./tests/test_converter.py
# tests/test_converter.py
import json, os, pytest, subprocess
from tools import aix_to_gemini as converter
from jsonschema import validate, ValidationError

# Define base path relative to this file's location
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHEMA_PATH = os.path.join(BASE, "schemas", "gemini_agent.schema.json")
CONVERTER_SCRIPT = os.path.join(BASE, "tools", "aix_to_gemini.py")

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

@pytest.fixture
def schema():
    return load_json(SCHEMA_PATH)

def test_valid_aix_conversion(tmp_path, schema):
    sample = {
        "id": "amrikyy-superpower-v1",
        "name": "AMRIKYY SUPERPOWER",
        "model": "gemini-2.5-pro",
        "context_window": 32768,
        "require_user_approval_for_write": True,
        "entrypoint_prompt": "hello",
        "modes": [{"id": "triage", "name": "Triage", "description": "..."}],
        "policies": {"max_patch_lines": 40},
        "metadata": {"owner": "test"}
    }
    in_file = tmp_path / "in.aix"
    out_file = tmp_path / "out.json"
    in_file.write_text(json.dumps(sample), encoding='utf-8')

    # Test programmatic mapping
    agent = converter.map_fields(sample)
    validate(instance=agent, schema=schema)
    assert agent['id'] == sample['id']
    assert agent['require_user_approval_for_write'] is True

    # Test command-line execution
    result = subprocess.run(
        ["python3", CONVERTER_SCRIPT, str(in_file), str(out_file)],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"Converter script failed: {result.stderr}"
    assert out_file.exists()
    
    out_data = load_json(str(out_file))
    validate(instance=out_data, schema=schema)
    assert out_data['id'] == sample['id']

def test_missing_required_field_fails_validation(tmp_path):
    sample = {
        "id": "test-no-model"
        # name, model, etc. are missing
    }
    in_file = tmp_path / "in.json"
    out_file = tmp_path / "out.json"
    in_file.write_text(json.dumps(sample), encoding='utf-8')

    result = subprocess.run(
        ["python3", CONVERTER_SCRIPT, str(in_file), str(out_file)],
        capture_output=True, text=True
    )
    assert result.returncode == 1, "Converter should fail for invalid schema"
    assert "VALIDATION_ERROR" in result.stderr

def test_redaction_of_secrets(schema):
    sample = {
        "id": "test-redact",
        "name": "Redaction Test",
        "model": "gemini-2.5-pro",
        "context_window": 8192,
        "require_user_approval_for_write": True,
        "entrypoint_prompt": "My token is: tok_12345ABCDE",
        "modes": [],
        "metadata": {
            "api_key": "supersecretkey123",
            "contact_email": "test@example.com"
        }
    }
    redacted_agent = converter.redact_values(sample)
    mapped_agent = converter.map_fields(redacted_agent)

    validate(instance=mapped_agent, schema=schema)
    assert mapped_agent['metadata']['api_key'] == "REDACTED_BY_POLICY"
    assert mapped_agent['entrypoint_prompt'] == "REDACTED_BY_POLICY"
EOF
echo "  [+] Created ./tests/test_converter.py"


# --- 6) .github/workflows/aix-validate-and-convert.yml ---
cat <<'EOF' > ./.github/workflows/aix-validate-and-convert.yml
name: AIX Validate & Convert
on:
  push:
    branches: [ main ]
    paths:
      - '.gemini/agents/**.aix'
      - 'tools/aix_to_gemini.py'
      - 'schemas/gemini_agent.schema.json'
      - 'tests/test_converter.py'
  pull_request:
    paths:
      - '.gemini/agents/**.aix'
      - 'tools/aix_to_gemini.py'
      - 'schemas/gemini_agent.schema.json'
      - 'tests/test_converter.py'

jobs:
  validate-and-convert:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install jsonschema pytest pyyaml

      - name: Create dummy output directory
        run: mkdir -p out

      - name: Convert AIX to Gemini JSON
        run: |
          python3 tools/aix_to_gemini.py ./.gemini/agents/SUPERPOWER.aix ./out/agent_config.json

      - name: Run PyTest on the converter
        run: pytest -v tests/

      - name: Upload converted artifact
        uses: actions/upload-artifact@v4
        with:
          name: gemini-agent-config
          path: ./out/agent_config.json
EOF
echo "  [+] Created ./.github/workflows/aix-validate-and-convert.yml"


# --- 7) .github/workflows/aix-pipeline.yml ---
cat <<'EOF' > ./.github/workflows/aix-pipeline.yml
name: AIX Full Pipeline
on:
  workflow_dispatch:
  push:
    branches:
      - 'release/**' # Example: run on pushes to release branches

jobs:
  build_and_test:
    uses: ./.github/workflows/aix-validate-and-convert.yml

  full_pipeline:
    needs: build_and_test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download agent config artifact
        uses: actions/download-artifact@v4
        with:
          name: gemini-agent-config
          path: ./out

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      
      - name: Install dependencies
        run: pip install pyyaml

      - name: Security scan on source code and config
        run: |
          python3 tools/security_scan.py .

      - name: Create draft PR if auto-updates are allowed
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Note: This is a simplified check.
          # A real implementation would parse the JSON more robustly.
          if grep -q '"require_user_approval_for_write": false' ./out/agent_config.json; then
            echo "Auto-approval is enabled. Creating PR..."
            git config user.name "github-actions[bot]"
            git config user.email "github-actions[bot]@users.noreply.github.com"
            BRANCH_NAME="bot/auto-update-agent-$(date +%s)"
            git checkout -b "$BRANCH_NAME"
            git add out/agent_config.json
            git commit -m "feat(agent): Automatically update Gemini agent configuration"
            git push --set-upstream origin "$BRANCH_NAME"
            gh pr create --title "🤖 feat(agent): Update Gemini Agent Config" --body "This PR was auto-generated by the AIX Full Pipeline." --draft
          else
            echo "Manual approval required. Skipping PR creation."
          fi
EOF
echo "  [+] Created ./.github/workflows/aix-pipeline.yml"


# --- 8) .github/pull_request_template.md ---
cat <<'EOF' > ./.github/pull_request_template.md
## Title
<!-- fix/feat/chore: Short description of change -->

## Summary
<!-- A brief summary of the proposed changes. What is the goal? -->

---

### Related Information
- **AIX Source ID**: `amrikyy-superpower-v1`
- **Related Issue**: #

---

### Changes Overview
- [ ] Converted `.gemini/agents/SUPERPOWER.aix` to `out/agent_config.json`
- [ ] Updated Python converter logic in `tools/aix_to_gemini.py`
- [ ] Added/updated tests in `tests/test_converter.py`
- [ ] Modified CI workflow in `.github/workflows/`

---

### Risk Assessment
- **Risk Score (1-10)**: __
- **Potential Impact**: 
- **Revert Strategy**:
  ```bash
  # For a merged PR
  git revert --no-edit <merge-commit-sha>
  ```

---

### Verification Steps
<!-- How can the reviewer verify these changes? -->
1.  Run `pip install jsonschema pytest pyyaml`
2.  Execute `python3 tools/aix_to_gemini.py .gemini/agents/SUPERPOWER.aix out/agent_config.json`
3.  Run tests with `pytest -v`
EOF
echo "  [+] Created ./.github/pull_request_template.md"

# --- 9) tools/security_scan.py ---
cat <<'EOF' > ./tools/security_scan.py
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
EOF
echo "  [+] Created ./tools/security_scan.py"

# --- 10) security/rules.yaml ---
cat <<'EOF' > ./security/rules.yaml
- id: leaked_api_key
  pattern: "(api[_-]?key|secret|token|password)s*[:=]s*['\"]?[A-Za-z0-9_\\-]{16,}"
  severity: critical
- id: private_key
  pattern: "-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----"
  severity: critical
- id: probable_jwt
  pattern: "eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}"
  severity: high
- id: suspicious_todo_backdoor
  pattern: "TODO\\s*:\\s*.*(password|backdoor|eval\\(|exec\\("
  severity: high
- id: vulnerable_dependency_hardcoded
  pattern: "(lodash)@([0-3]\\.|4\\.[0-16]\\.)" # Example for old lodash
  severity: medium
EOF
echo "  [+] Created ./security/rules.yaml"


# --- 11) examples/prompts/triage_examples.json ---
cat <<'EOF' > ./examples/prompts/triage_examples.json
[
  {
    "input_context": "User reports intermittent login failures. The following code snippet is from src/auth.py.",
    "input_code": "def check_password(pwd):\n    # TODO: remove this backdoor for testing\n    if pwd == 'master_override_password': return True\n    return db.verify(pwd)",
    "expected_output": {
      "findings": [
        {"path": "src/auth.py", "line": 3, "severity": "critical", "confidence": 0.98, "explanation": "A hard-coded backdoor password was found, allowing unauthorized access."}
      ]
    }
  },
  {
    "input_context": "Security scan of package.json dependencies.",
    "input_code": "{\n  \"dependencies\": {\n    \"express\": \"4.17.1\",\n    \"lodash\": \"4.12.0\"\n  }\n}",
    "expected_output": {
      "findings": [
        {"path": "package.json", "line": 4, "severity": "medium", "confidence": 0.9, "explanation": "The 'lodash' version 4.12.0 is outdated and has known security vulnerabilities."}
      ]
    }
  }
]
EOF
echo "  [+] Created ./examples/prompts/triage_examples.json"

# --- 12) benchmark/tasks.yaml ---
cat <<'EOF' > ./benchmark/tasks.yaml
- id: task_01_triage_secret
  description: "Detect a hard-coded secret in a Python file"
  repo: examples/repos/python-monolith
  type: triage
  ground_truth:
    expected_findings:
      - path: src/auth.py
        severity: critical
        explanation_keyword: "secret"

- id: task_02_patch_dependency
  description: "Generate a patch to update a vulnerable JS dependency"
  repo: examples/repos/microservice-js # This would be another synthetic repo
  type: patch
  ground_truth:
    patch_applies_cleanly: true
    tests_still_pass: true

# ... up to 10 tasks (SYNTHETIC)
- id: task_10_explain_logic
  description: "Explain a complex algorithm in simple terms"
  repo: examples/repos/algo-lib
  type: explain
  ground_truth:
    explanation_contains_keywords: ["recursion", "base case"]
EOF
echo "  [+] Created ./benchmark/tasks.yaml"

# --- 13) benchmark/run_benchmark.py ---
cat <<'EOF' > ./benchmark/run_benchmark.py
#!/usr/bin/env python3
# benchmark/run_benchmark.py
import argparse, yaml, csv, json, time, os

def run_synthetic_task(agent_config, task):
    """SYNTHETIC runner: simulates a call to the Gemini agent."""
    print(f"-> Running synthetic task: {task['id']}...")
    start_time = time.time()
    
    # Simulate agent performance based on task type
    # These are placeholder values
    precision, recall, patch_success = 0.0, 0.0, 0.0
    if task['type'] == 'triage':
        precision, recall = 0.92, 0.88
    elif task['type'] == 'patch':
        patch_success = 0.78
    
    runtime_seconds = (hash(task['id']) % 2000) / 100.0 + 5.0 # pseudo-random runtime
    
    # Aggregate score calculation
    score = (0.4 * precision) + (0.3 * patch_success) + (0.2 * recall)
    score += 0.1 * max(0, 1.0 - (runtime_seconds / 60.0)) # Normalize runtime penalty

    return {
        "task_id": task['id'],
        "agent_model": agent_config.get('model', 'unknown'),
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "patch_success_rate": round(patch_success, 3),
        "runtime_seconds": round(runtime_seconds, 2),
        "aggregate_score": round(score, 4)
    }

def main():
    parser = argparse.ArgumentParser(description="Run a benchmark suite for a Gemini agent.")
    parser.add_argument("--agent", required=True, help="Path to the agent_config.json file.")
    parser.add_argument("--tasks", required=True, help="Path to the tasks.yaml file.")
    parser.add_argument("--out", required=True, help="Path to the output CSV file.")
    args = parser.parse_args()

    try:
        with open(args.agent, 'r') as f:
            agent_config = json.load(f)
        with open(args.tasks, 'r') as f:
            tasks = yaml.safe_load(f)
    except FileNotFoundError as e:
        print(f"Error: Cannot find file - {e}", file=sys.stderr)
        sys.exit(1)

    results = [run_synthetic_task(agent_config, t) for t in tasks]
    
    if not results:
        print("No tasks were run. Exiting.", file=sys.stderr)
        return

    # Write to CSV
    header = results[0].keys()
    with open(args.out, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(results)
    
    print(f"\nBenchmark complete. Results written to {args.out}")

if __name__ == "__main__":
    main()
EOF
echo "  [+] Created ./benchmark/run_benchmark.py"

# --- 14) out/revert_commands.txt ---
cat <<'EOF' > ./out/revert_commands.txt
# Revert Recommendations for Automated Changes

## Scenario 1: Reverting a merged Pull Request
If an automated PR from the agent has been merged into the main branch, use `git revert`. This creates a new commit that undoes the changes.

```bash
# Find the merge commit SHA from the PR
MERGE_COMMIT_SHA="<sha-of-merge-commit>"

# Execute the revert command. --no-edit uses the default message.
git revert --no-edit $MERGE_COMMIT_SHA
```

## Scenario 2: Deleting an unmerged branch from an agent PR
If the PR has not been merged, you can simply close the PR and delete the remote branch.

```bash
# The branch name is typically in the format bot/auto-update-agent-<timestamp>
BRANCH_NAME="<agent-generated-branch-name>"

# Delete the remote branch
git push origin --delete $BRANCH_NAME
```
EOF
echo "  [+] Created ./out/revert_commands.txt"

# --- 15) out/patches/README.md ---
cat <<'EOF' > ./out/patches/README.md
# Agent-Generated Patches

This directory contains `.patch` files generated by the AMRIKYY SUPERPOWER agent in `patch` mode.

## Applying a Patch

To apply a patch, use the `git apply` command from the root of the repository.

**Example:**
```bash
# 1. Ensure you are on a new branch
git checkout -b fix/apply-patch-123

# 2. Apply the patch
git apply out/patches/issue-123.patch

# 3. Verify the changes and run tests
# ...

# 4. Commit the changes
git add .
git commit -m "fix: Apply patch for issue 123"
```

**WARNING**: Always review patches carefully before applying them to your codebase.
EOF
echo "  [+] Created ./out/patches/README.md"


# --- Create a synthetic repo file for the security scanner ---
cat <<'EOF' > ./examples/repos/python-monolith/src/auth.py
# src/auth.py
# This is a synthetic file for testing the security scanner.

def login(user, password):
    # A hardcoded secret for testing purposes.
    api_key = "ABC-123-XYZ-789-VERY-SECRET-KEY"
    if user == "admin":
        return True
    return False

# TODO: fix this backdoor for user 'super'
def check_access(user):
    return True
EOF
echo "  [+] Created synthetic repo file for security scan."


echo ""
echo "==> [3/4] Running local E2E test plan..."
echo ""
echo "--- Preparing Python environment ---"
python3 -m venv .venv
source .venv/bin/activate
pip install -q jsonschema pytest pyyaml
echo "  [+] Virtual environment created and dependencies installed."
echo ""

echo "--- Running Python converter ---"
python3 tools/aix_to_gemini.py ./.gemini/agents/SUPERPOWER.aix ./out/agent_config.json
echo ""

echo "--- Running tests (PyTest) ---"
pytest -v
echo ""

echo "--- Running security scan ---"
python3 tools/security_scan.py ./examples/repos/python-monolith
echo ""

echo "--- Running benchmark (synthetic) ---"
python3 benchmark/run_benchmark.py --agent ./out/agent_config.json --tasks ./benchmark/tasks.yaml --out ./benchmark/results.csv
cat ./benchmark/results.csv
echo ""

echo "==> [4/4] Setup complete!"
echo "The full synthetic environment has been created."
echo "You can now inspect the generated files or re-run commands manually."
