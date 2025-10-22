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
REDACT_REGEX = re.compile(r"(?:api[_-]?key|secret|token|password)\s*(?:is)?\s*[:=]\s*", re.IGNORECASE)

def redact_values(obj):
    if isinstance(obj, dict):
        return {k: "REDACTED_BY_POLICY" if isinstance(v, str) and re.search(r"key|secret|token|password", k, re.IGNORECASE) else redact_values(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact_values(x) for x in obj]
    if isinstance(obj, str):
        if re.search(REDACT_REGEX, obj):
            return "REDACTED_BY_POLICY"
        return obj
    return obj

def map_fields(aix):
    agent = {}
    # Handle required fields without defaults
    for field in ['name', 'model', 'context_window', 'entrypoint_prompt', 'modes', 'require_user_approval_for_write']:
        if field in aix:
            agent[field] = aix[field]

    # Special handling for id
    if 'id' in aix:
        agent['id'] = aix['id']
    elif 'name' in aix:
        agent['id'] = aix['name'].lower().replace(' ', '-')

    # Handle type conversions for fields that are present
    if 'context_window' in agent:
        agent['context_window'] = int(agent['context_window'])
    if 'require_user_approval_for_write' in agent:
        agent['require_user_approval_for_write'] = bool(agent['require_user_approval_for_write'])
    if 'entrypoint_prompt' in agent:
        agent['entrypoint_prompt'] = agent['entrypoint_prompt'].strip()

    # Optional fields with defaults
    agent['description'] = aix.get('description', '')
    agent['policies'] = aix.get('policies', {})
    agent['metadata'] = aix.get('metadata', {})
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
