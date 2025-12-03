# MCP Debugger for VS Code

Advanced debugging for Node.js and TypeScript applications with AI-powered features through the Model Context Protocol (MCP).

## Features

### 🐛 Advanced Debugging
- **Smart Breakpoints**: AI-suggested breakpoint locations based on code analysis
- **Conditional Breakpoints**: Break only when specific conditions are met
- **Hang Detection**: Automatically detect infinite loops and hanging processes
- **Source Map Support**: Debug TypeScript with full source map integration

### 📊 Performance Profiling
- **CPU Profiling**: Identify performance bottlenecks
- **Memory Profiling**: Take heap snapshots and detect memory leaks
- **Performance Timeline**: Track execution events and timing

### 🤖 AI Integration
- **GitHub Copilot Ready**: Works seamlessly with GitHub Copilot
- **MCP Protocol**: Exposes debugging capabilities to AI agents
- **Smart Suggestions**: AI-powered debugging recommendations

### 🧪 Test Framework Support
- **Jest**: Debug Jest tests with breakpoints
- **Mocha**: Debug Mocha tests
- **Vitest**: Debug Vitest tests

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "TypeScript MCP Debugger"
4. Click Install

### Install the MCP Debugger Server

The extension requires the MCP debugger server to function. Install it globally:

```bash
npm install -g @ai-capabilities-suite/mcp-debugger-server
```

Or install it in your project:

```bash
npm install --save-dev @ai-capabilities-suite/mcp-debugger-server
```

### From VSIX File

```bash
code --install-extension ts-mcp-debugger-1.0.0.vsix
```

## Quick Start

### 1. Start Debugging

**Option A: Use Command Palette**
1. Open a JavaScript or TypeScript file
2. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
3. Type "MCP Debugger: Start Debug Session"
4. Press Enter

**Option B: Use Debug Configuration**
1. Open the Debug view (Ctrl+Shift+D / Cmd+Shift+D)
2. Click "create a launch.json file"
3. Select "MCP Node.js Debugger"
4. Press F5 to start debugging

### 2. Detect Hangs

1. Open a file that might have infinite loops
2. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
3. Type "MCP Debugger: Detect Hanging Process"
4. View hang detection results

### 3. Set Smart Breakpoints

1. Place cursor on a line
2. Right-click and select "MCP Debugger: Set Smart Breakpoint"
3. Choose from AI-suggested breakpoint locations

## Configuration

### Settings

Configure the extension in VS Code settings (`Ctrl+,` / `Cmd+,`):

```json
{
  "mcp-debugger.serverPath": "",
  "mcp-debugger.autoStart": true,
  "mcp-debugger.defaultTimeout": 30000,
  "mcp-debugger.enableHangDetection": true,
  "mcp-debugger.hangDetectionTimeout": 5000,
  "mcp-debugger.enableProfiling": false,
  "mcp-debugger.logLevel": "info"
}
```

### Launch Configurations

Add to `.vscode/launch.json`:

#### Debug Current File
```json
{
  "type": "mcp-node",
  "request": "launch",
  "name": "MCP Debug Current File",
  "program": "${file}",
  "cwd": "${workspaceFolder}",
  "enableHangDetection": true
}
```

#### Debug with Profiling
```json
{
  "type": "mcp-node",
  "request": "launch",
  "name": "MCP Debug with Profiling",
  "program": "${workspaceFolder}/index.js",
  "cwd": "${workspaceFolder}",
  "enableProfiling": true,
  "enableHangDetection": true
}
```

#### Debug Jest Tests
```json
{
  "type": "mcp-node",
  "request": "launch",
  "name": "MCP Debug Jest",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "cwd": "${workspaceFolder}",
  "enableHangDetection": true
}
```

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `MCP Debugger: Start Debug Session` | Start debugging current file | - |
| `MCP Debugger: Detect Hanging Process` | Detect infinite loops | - |
| `MCP Debugger: Set Smart Breakpoint` | Set AI-suggested breakpoint | - |
| `MCP Debugger: Start CPU Profiling` | Start CPU profiler | - |
| `MCP Debugger: Take Heap Snapshot` | Take memory snapshot | - |

## Usage Examples

### Example 1: Debug a Node.js Application

```javascript
// app.js
function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(result);
```

1. Open `app.js`
2. Set a breakpoint on line 3 (inside the loop)
3. Press F5 to start debugging
4. Step through the code with F10 (Step Over)
5. Inspect variables in the Debug sidebar

### Example 2: Detect an Infinite Loop

```javascript
// hang.js
function infiniteLoop() {
  let i = 0;
  while (true) {
    i++;
    // This will hang forever
  }
}

infiniteLoop();
```

1. Open `hang.js`
2. Run "MCP Debugger: Detect Hanging Process"
3. View hang detection results showing the infinite loop location

### Example 3: Profile Performance

```javascript
// slow.js
function slowFunction() {
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

slowFunction();
```

1. Open `slow.js`
2. Start debugging with profiling enabled
3. Run "MCP Debugger: Start CPU Profiling"
4. Let the code execute
5. View CPU profile to identify bottlenecks

## GitHub Copilot Integration

The MCP Debugger works seamlessly with GitHub Copilot for AI-assisted debugging:

1. **Debugging Context**: Copilot can access debugging information
2. **Smart Suggestions**: Get AI-powered debugging recommendations
3. **Breakpoint Suggestions**: Copilot suggests optimal breakpoint locations
4. **Error Analysis**: Copilot helps analyze errors and exceptions
5. **Autonomous Debugging**: Copilot can debug code automatically

### Quick Start with Copilot

1. Open Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)
2. Ask: "Debug this file and find the bug"
3. Copilot will automatically use the MCP Debugger tools

### Example Conversations

```
You: "Debug this function and tell me why it returns undefined"
Copilot: [Starts debug session, sets breakpoints, inspects variables, explains issue]

You: "Check if this script has an infinite loop"
Copilot: [Uses hang detection, identifies loop location, suggests fix]

You: "Why is this function so slow?"
Copilot: [Profiles code, identifies bottlenecks, suggests optimizations]
```

### Learn More

See the [Copilot Integration Guide](COPILOT-GUIDE.md) for:
- Detailed setup instructions
- Complete debugging workflows
- Example conversations
- Tips and best practices
- Troubleshooting guide

## Troubleshooting

### MCP Server Not Starting

**Problem**: Extension shows "MCP Debugger server not running"

**Solution**:
1. Check if Node.js is installed: `node --version`
2. Install MCP server: `npm install -g @ai-capabilities-suite/mcp-debugger-server`
3. Set custom server path in settings if needed
4. Restart VS Code

### Breakpoints Not Working

**Problem**: Breakpoints are not being hit

**Solution**:
1. Ensure source maps are enabled for TypeScript
2. Check that file paths are absolute
3. Verify the program is actually executing the code
4. Try setting a breakpoint on the first line

### Hang Detection False Positives

**Problem**: Hang detection reports hangs for legitimate long-running operations

**Solution**:
1. Increase `mcp-debugger.hangDetectionTimeout` in settings
2. Disable hang detection for specific debug sessions
3. Use conditional breakpoints instead

### Performance Issues

**Problem**: Debugging is slow

**Solution**:
1. Disable profiling if not needed
2. Reduce number of breakpoints
3. Increase timeout values
4. Close other VS Code extensions

## Requirements

- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 16.x or higher
- **Operating System**: Windows, macOS, or Linux

## Extension Settings

This extension contributes the following settings:

* `mcp-debugger.serverPath`: Path to MCP debugger server executable
* `mcp-debugger.autoStart`: Automatically start MCP server when VS Code opens
* `mcp-debugger.defaultTimeout`: Default timeout for debug operations (ms)
* `mcp-debugger.enableHangDetection`: Enable automatic hang detection
* `mcp-debugger.hangDetectionTimeout`: Timeout for hang detection (ms)
* `mcp-debugger.enableProfiling`: Enable performance profiling features
* `mcp-debugger.logLevel`: Log level (debug, info, warn, error)

## Known Issues

- WebSocket connections may timeout on slow networks
- Source maps must be inline or in the same directory
- Some Node.js native modules may not be debuggable

## Release Notes

### 1.0.0

Initial release:
- Advanced debugging with MCP integration
- Hang detection
- CPU and memory profiling
- Smart breakpoint suggestions
- GitHub Copilot integration
- Test framework support (Jest, Mocha, Vitest)

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/yourusername/mcp-debugger/issues).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## More Information

- [MCP Debugger Documentation](https://github.com/yourusername/mcp-debugger)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

---

**Enjoy debugging with AI! 🚀**
