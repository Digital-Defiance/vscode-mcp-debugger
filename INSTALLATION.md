# MCP Debugger - Installation Guide

## Prerequisites

Before installing the MCP Debugger extension, ensure you have:

- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 16.x or higher
- **npm** or **yarn**: For package management

## Installation Methods

### Method 1: VS Code Marketplace (Recommended)

Once published, you can install directly from the VS Code Marketplace:

1. Open VS Code
2. Click on the Extensions icon in the sidebar (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "MCP Debugger"
4. Click the "Install" button
5. Reload VS Code when prompted

### Method 2: Install from VSIX File

If you have a `.vsix` file:

#### Using VS Code UI
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click the "..." menu at the top of the Extensions view
4. Select "Install from VSIX..."
5. Navigate to the `.vsix` file and select it
6. Reload VS Code when prompted

#### Using Command Line
```bash
code --install-extension mcp-debugger-1.0.0.vsix
```

### Method 3: Build from Source

For developers who want to build from source:

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-debugger.git
cd mcp-debugger/packages/vscode-mcp-debugger

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
npm run package

# Install the generated .vsix file
code --install-extension mcp-debugger-1.0.0.vsix
```

## Post-Installation Setup

### 1. Install MCP Debugger Server

The extension requires the MCP Debugger server to function. Install it globally:

```bash
npm install -g @ai-capabilities-suite/mcp-debugger-server
```

Or use it via npx (no installation required):
```bash
# The extension will automatically use npx if no server path is configured
```

### 2. Configure Extension Settings

Open VS Code settings (`Ctrl+,` / `Cmd+,`) and configure:

```json
{
  "mcp-debugger.serverPath": "",  // Leave empty to use npx
  "mcp-debugger.autoStart": true,
  "mcp-debugger.defaultTimeout": 30000,
  "mcp-debugger.enableHangDetection": true,
  "mcp-debugger.hangDetectionTimeout": 5000,
  "mcp-debugger.enableProfiling": false,
  "mcp-debugger.logLevel": "info"
}
```

### 3. Verify Installation

1. Open a JavaScript or TypeScript file
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type "MCP Debugger" - you should see the extension commands
4. Check the Output panel (View → Output) and select "MCP Debugger" to see logs

## Troubleshooting Installation

### Extension Not Appearing

**Problem**: Extension doesn't show up in Extensions view

**Solution**:
1. Restart VS Code
2. Check if the extension is disabled: Extensions → Filter → Show Disabled Extensions
3. Enable the extension if it's disabled
4. Check VS Code version: Help → About (must be 1.85.0+)

### Server Not Starting

**Problem**: "MCP Debugger server not running" error

**Solution**:
1. Install Node.js: https://nodejs.org/
2. Install MCP server: `npm install -g @ai-capabilities-suite/mcp-debugger-server`
3. Check Node.js version: `node --version` (must be 16.x+)
4. Check npm version: `npm --version`
5. Restart VS Code

### Permission Errors (macOS/Linux)

**Problem**: Permission denied when installing globally

**Solution**:
```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g @ai-capabilities-suite/mcp-debugger-server

# Option 2: Configure npm to use a different directory (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @ai-capabilities-suite/mcp-debugger-server
```

### Extension Activation Failed

**Problem**: Extension fails to activate

**Solution**:
1. Check the Output panel: View → Output → MCP Debugger
2. Look for error messages
3. Try disabling other extensions that might conflict
4. Reinstall the extension
5. Check VS Code logs: Help → Toggle Developer Tools → Console

### VSIX Installation Fails

**Problem**: "Unable to install extension" error

**Solution**:
1. Ensure the `.vsix` file is not corrupted
2. Check file permissions
3. Try installing from command line: `code --install-extension path/to/extension.vsix`
4. Clear VS Code cache:
   - Close VS Code
   - Delete: `~/.vscode/extensions` (backup first!)
   - Restart VS Code and reinstall

## Updating the Extension

### From Marketplace
VS Code will automatically notify you of updates. Click "Update" when prompted.

### Manual Update
1. Uninstall the old version
2. Install the new version using any of the methods above

## Uninstalling

### Using VS Code UI
1. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
2. Find "MCP Debugger"
3. Click the gear icon
4. Select "Uninstall"
5. Reload VS Code

### Using Command Line
```bash
code --uninstall-extension mcp-debugger.mcp-debugger
```

### Clean Uninstall
To remove all extension data:

```bash
# Uninstall extension
code --uninstall-extension mcp-debugger.mcp-debugger

# Remove global server (optional)
npm uninstall -g @ai-capabilities-suite/mcp-debugger-server

# Remove extension data (optional)
# macOS/Linux
rm -rf ~/.vscode/extensions/mcp-debugger.*

# Windows
# Remove: %USERPROFILE%\.vscode\extensions\mcp-debugger.*
```

## Platform-Specific Notes

### Windows
- Use PowerShell or Command Prompt for npm commands
- Paths use backslashes: `C:\path\to\file`
- May need to run as Administrator for global installs

### macOS
- Use Terminal for npm commands
- May need to configure npm prefix to avoid sudo
- Paths use forward slashes: `/path/to/file`

### Linux
- Use Terminal for npm commands
- May need to configure npm prefix to avoid sudo
- Ensure Node.js is in PATH
- Some distributions may require additional packages

## Getting Help

If you encounter issues:

1. **Check Documentation**: Read the [README](README.md) and [CHANGELOG](CHANGELOG.md)
2. **Check Logs**: View → Output → MCP Debugger
3. **Search Issues**: https://github.com/yourusername/mcp-debugger/issues
4. **Report Bug**: Create a new issue with:
   - VS Code version
   - Node.js version
   - Operating system
   - Error messages
   - Steps to reproduce

## Next Steps

After installation:

1. Read the [README](README.md) for usage instructions
2. Try the [Quick Start](README.md#quick-start) guide
3. Explore the [Configuration](README.md#configuration) options
4. Check out [Usage Examples](README.md#usage-examples)

---

**Happy Debugging! 🚀**
