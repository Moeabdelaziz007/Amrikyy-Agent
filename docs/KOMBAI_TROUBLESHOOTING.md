# Kombai Troubleshooting - Quick Reference

This is a quick reference guide for the most common Kombai issues, particularly the shell integration problem mentioned in FAQ #4.

## FAQ #4: "I am unable to start the preview - IDE doesn't have shell integration"

This is the most common Kombai issue. Here's how to fix it:

### Windows (PowerShell) - Quick Fix

```powershell
# 1. Check PowerShell version (must be 7+)
$PSVersionTable.PSVersion

# 2. Set execution policy (run PowerShell as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Confirm with 'Y' when prompted

# 4. Restart your IDE
```

### macOS/Linux - Quick Fix

```bash
# 1. Check your shell
echo $SHELL

# 2. If using Oh My Zsh or similar, edit ~/.zshrc or ~/.bashrc
# Wrap interactive code in conditional:
if [[ $- == *i* ]]; then
    # Your interactive configurations here
fi

# 3. Reload shell
source ~/.zshrc  # or source ~/.bashrc

# 4. Restart your IDE
```

## Common Error Messages and Solutions

### "Shell integration not available"

**Cause:** Your IDE doesn't have shell integration enabled or configured correctly.

**Solution:**
1. Enable terminal shell integration in IDE settings
2. Windows: Update PowerShell to version 7+
3. macOS/Linux: Remove interactive-only commands from shell profile
4. Restart IDE

### "Unable to start preview"

**Cause:** Development server not running or port blocked.

**Solution:**
```bash
# Kill existing process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Restart dev server
cd frontend
npm run dev
```

### "Permission denied" or "Access denied"

**Cause:** Insufficient permissions or restrictive execution policy.

**Solution:**
- Windows: Run PowerShell as Administrator and set execution policy
- macOS/Linux: Check file permissions on project folder
- Ensure antivirus/firewall isn't blocking Node.js or shell commands

### "Connection lost" or "Failed to connect"

**Cause:** Network issue between Kombai and dev server.

**Solution:**
1. Check if dev server is running: `npm run dev`
2. Verify you can access http://localhost:5173 in browser
3. Use Kombai's "Reconnect" button
4. Restart dev server if needed

### "Module not found" or dependency errors

**Cause:** npm dependencies not installed or corrupted.

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with cache clean
npm cache clean --force
npm install
```

## Pre-Flight Checklist

Before reporting an issue, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PowerShell 7+ on Windows (`$PSVersionTable.PSVersion`)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Can access http://localhost:5173 in browser
- [ ] Terminal integration enabled in IDE settings
- [ ] Execution policy set (Windows) or shell profile configured (macOS/Linux)
- [ ] IDE restarted after configuration changes
- [ ] No firewall/antivirus blocking localhost:5173

## IDE-Specific Quick Checks

### VS Code
```
Settings → Features → Terminal → Integrated: Shell Integration → ✓ Enabled
```

### WebStorm/IntelliJ
```
Settings → Tools → Terminal → Shell Integration → ✓ Enabled
Settings → Tools → Terminal → Shell path → Verify correct shell path
```

## Still Not Working?

1. **Check full setup guide:** [KOMBAI_SETUP.md](../KOMBAI_SETUP.md)
2. **Review error logs:** Check IDE console and terminal output
3. **Test basic functionality:** Can you run `npm run dev` in terminal?
4. **Contact support:** support@kombai.com with:
   - OS and version
   - IDE and version
   - Shell type and version
   - Error messages or screenshots

## Additional Resources

- [Complete Kombai Setup Guide](../KOMBAI_SETUP.md)
- [Kombai Official Documentation](https://docs.kombai.com/)
- [Kombai FAQ](https://docs.kombai.com/troubleshooting/frequently-asked-questions)
- [Frontend Setup Instructions](../README.md)
