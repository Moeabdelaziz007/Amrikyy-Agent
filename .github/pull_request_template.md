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
