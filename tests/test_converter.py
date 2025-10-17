# tests/test_converter.py
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
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
