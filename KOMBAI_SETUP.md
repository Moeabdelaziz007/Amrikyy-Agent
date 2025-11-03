# Kombai Setup Guide for Amrikyy AI OS Frontend

This guide helps you set up Kombai for the Amrikyy AI OS frontend, specifically addressing shell integration issues and ensuring smooth preview functionality.

## Overview

Kombai is a design-to-code tool that requires shell integration to run browser previews and execute terminal commands directly from your IDE. This guide covers the complete setup process and troubleshooting steps.

## Prerequisites

- Node.js (v18 or higher)
- npm
- VS Code, JetBrains IDE, or another supported IDE
- PowerShell 7+ (Windows) or Bash/Zsh (macOS/Linux)

## Initial Setup

### 1. Install Frontend Dependencies

First, ensure all frontend dependencies are installed:

```bash
cd frontend
npm install
```

### 2. Verify Development Server

Test that the development server works correctly:

```bash
npm run dev
```

The server should start on `http://localhost:5173`. Press `Ctrl+C` to stop.

## Shell Integration Setup

### For Windows Users (PowerShell)

Kombai requires PowerShell with proper execution policies to run preview commands.

#### Step 1: Update PowerShell

1. Check your PowerShell version:
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. If below version 7, download and install the latest PowerShell:
   - Visit: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell
   - Or use winget: `winget install --id Microsoft.Powershell --source winget`

#### Step 2: Set Execution Policy

1. Open PowerShell as Administrator

2. Check current execution policy:
   ```powershell
   Get-ExecutionPolicy
   ```

3. If it shows `Restricted` or `AllSigned`, change it:
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. Confirm by typing `Y` when prompted

5. Verify the change:
   ```powershell
   Get-ExecutionPolicy
   ```
   Should now show `RemoteSigned`

#### Step 3: Restart Your IDE

After changing execution policies, restart VS Code or your IDE completely.

### For macOS/Linux Users

#### Step 1: Verify Shell

1. Check your default shell:
   ```bash
   echo $SHELL
   ```

2. Ensure you're using a supported shell (bash, zsh, or fish)

#### Step 2: Configure Shell Profile (if using Oh My Zsh or similar)

If you use Oh My Zsh, Powerlevel10k, or other shell customizations:

1. Open your shell configuration file:
   - For zsh: `~/.zshrc`
   - For bash: `~/.bash_profile` or `~/.bashrc`

2. Wrap interactive configurations in conditional blocks to prevent issues with IDE shell loading:

   ```bash
   # Only run in interactive shells
   if [[ $- == *i* ]]; then
       # Your interactive shell configurations here
       # source ~/.oh-my-zsh/oh-my-zsh.sh
   fi
   ```

3. Save and reload your shell:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

#### Step 3: Restart Your IDE

Restart your IDE to ensure it picks up the new shell configuration.

## IDE-Specific Setup

### VS Code

1. Install the Kombai extension from the VS Code marketplace

2. Verify terminal integration:
   - Open terminal in VS Code (`` Ctrl+` `` or `` Cmd+` ``)
   - Run: `npm run dev`
   - Ensure it starts without errors

3. Enable shell integration in VS Code settings:
   - Open Settings (`Ctrl+,` or `Cmd+,`)
   - Search for "terminal integrated shell integration"
   - Ensure it's enabled

### JetBrains IDEs (WebStorm, IntelliJ IDEA)

1. Install the Kombai plugin from the JetBrains marketplace

2. Configure terminal:
   - Go to Settings → Tools → Terminal
   - Ensure "Shell path" points to your preferred shell
   - Enable "Shell integration"

3. Verify environment loading:
   - JetBrains IDEs read shell environment on startup
   - Ensure your shell profile doesn't have commands that require interactive mode

## Kombai Preview Configuration

### Update Vite Configuration

The frontend uses Vite for development. Ensure the configuration is Kombai-compatible:

```javascript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external access
    port: 5173,
    strictPort: false, // Allow fallback to another port
    open: false, // Don't auto-open browser (Kombai handles this)
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  }
})
```

### Add Preview Script

Add a dedicated preview script in `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "kombai:preview": "vite --host --port 5173"
  }
}
```

## Troubleshooting

### Preview Won't Start

1. **Reload the IDE and Kombai extension**
   - In VS Code: `Ctrl+Shift+P` → "Reload Window"
   - In JetBrains: File → Invalidate Caches / Restart

2. **Kill and restart the development server**
   ```bash
   # Find and kill the process
   # On Windows:
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   
   # On macOS/Linux:
   lsof -ti:5173 | xargs kill -9
   
   # Restart
   npm run dev
   ```

3. **Check port availability**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   
   # macOS/Linux
   lsof -i:5173
   ```

4. **Use Kombai's reconnect feature**
   - Look for "Reconnect app" or "Retry" buttons in Kombai's interface
   - Click to re-establish connection

### Shell Integration Errors

1. **"Shell integration not available" error**
   - Windows: Verify PowerShell execution policy (see above)
   - macOS/Linux: Check shell profile for interactive-only commands
   - Restart IDE after making changes

2. **Terminal commands fail in Kombai**
   - Ensure terminal integration is enabled in IDE settings
   - Try running commands directly in IDE terminal first
   - Check for antivirus/firewall blocking shell execution

3. **Permission denied errors**
   - Windows: Run IDE as Administrator (temporarily to diagnose)
   - macOS/Linux: Check file permissions on node_modules and project folder

### Network/Connection Issues

1. **Verify internet access**
   - Ensure IDE has internet access
   - Check if other extensions requiring internet work

2. **Firewall/Proxy issues**
   - Add exception for localhost:5173 in firewall
   - If behind corporate proxy, configure npm proxy settings:
     ```bash
     npm config set proxy http://proxy-server:port
     npm config set https-proxy http://proxy-server:port
     ```

3. **Check Vite server status**
   - Ensure dev server is running: `npm run dev`
   - Access http://localhost:5173 directly in browser
   - Check terminal output for errors

### Preview Connection Lost

1. **Automatic reconnection**
   - Kombai shows "Connected", "Disconnected", or "Failed to load" status
   - Use UI buttons to reconnect

2. **Manual reconnection**
   - Stop dev server (`Ctrl+C`)
   - Restart: `npm run dev`
   - Reload Kombai preview

## Best Practices

1. **Keep dependencies updated**
   ```bash
   npm update
   ```

2. **Use consistent Node version**
   - Consider using nvm (Node Version Manager)
   - Ensure Node 18+ for best compatibility

3. **Clear cache when issues persist**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove and reinstall node_modules
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Monitor console output**
   - Keep terminal visible when using Kombai
   - Watch for errors or warnings
   - Check browser console (F12) for client-side errors

## Running Frontend with Kombai

Once setup is complete:

1. Open your IDE (VS Code, WebStorm, etc.)
2. Open the Amrikyy-Agent project
3. Open Kombai extension/plugin
4. Navigate to the frontend directory in terminal
5. Start the dev server:
   ```bash
   cd frontend
   npm run dev
   ```
6. In Kombai, start preview - it should automatically connect to http://localhost:5173
7. Make changes to your React components and see them reflected in Kombai's preview

## Additional Resources

- [Kombai Documentation](https://docs.kombai.com/)
- [Kombai Troubleshooting FAQ](https://docs.kombai.com/troubleshooting/frequently-asked-questions)
- [Kombai Browser Setup](https://docs.kombai.com/features/browser)
- [Vite Configuration Guide](https://vitejs.dev/config/)

## Getting Help

If you continue to experience issues:

1. Check the [GitHub Issues](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues) for similar problems
2. Contact Kombai support: support@kombai.com
3. Include in your support request:
   - Operating System and version
   - IDE and version
   - Shell type and version
   - Error messages or screenshots
   - Steps you've already tried

## Summary

This guide covers:
- ✅ Shell integration setup for Windows, macOS, and Linux
- ✅ IDE-specific configuration (VS Code, JetBrains)
- ✅ Vite configuration for Kombai compatibility
- ✅ Troubleshooting common preview and connection issues
- ✅ Best practices for maintaining a smooth Kombai workflow

With these steps completed, you should be able to use Kombai effectively with the Amrikyy AI OS frontend.
