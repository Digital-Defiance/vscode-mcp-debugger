# MCP Debugger for VS Code

Advanced debugging for Node.js and TypeScript applications with AI-powered features through the Model Context Protocol (MCP).

## 🔗 Repository

This package is now maintained in its own repository: **[https://github.com/Digital-Defiance/vscode-mcp-debugger](https://github.com/Digital-Defiance/vscode-mcp-debugger)**

This repository is part of the [AI Capabilitites Suite](https://github.com/Digital-Defiance/ai-capabilitites-suite) on GitHub.

## Features

### 🐛 Advanced Debugging
- **Smart Breakpoints**: AI-suggested breakpoint locations based on code analysis
- **Conditional Breakpoints**: Break only when specific conditions are met
- **Hang Detection**: Automatically detect infinite loops and hanging processes
- **Source Map Support**: Debug TypeScript with full source map integration
- **Code Lens**: Inline breakpoint suggestions at functions, loops, and error handlers

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

### 🎨 Language Server Protocol (LSP) Features

#### **Code Intelligence**
- **Hover Information**: Hover over variables to see debugging instructions and inspection tips
- **Signature Help**: Real-time parameter hints for all debugger functions with documentation
- **Inlay Hints**: Inline type annotations showing return types (session-id, breakpoint-id, variable types)
- **Document Symbols**: Outline view showing debug sessions, breakpoints, inspections, and hang detections
- **Semantic Tokens**: Syntax highlighting for debugger functions and variables

#### **Code Actions & Quick Fixes**
- **Convert console.log to breakpoint**: Transform logging statements into proper breakpoints with watch expressions
- **Remove console.log**: Clean up debugging statements
- **Wrap in try-catch**: Automatically add error handling around risky operations (e.g., JSON.parse)
- **Add hang detection**: Insert hang detection comments for infinite loops

#### **Navigation & Hierarchy**
- **Call Hierarchy**: Visualize debugger function dependencies and call relationships
- **Type Hierarchy**: Explore debugger type relationships (DebugSession, Breakpoint, StackFrame, Variable)
- **Document Links**: Quick links to debugger documentation
- **Go to Definition**: Navigate to debugger function definitions

#### **Code Editing**
- **Folding Ranges**: Collapse/expand debug session blocks
- **Selection Ranges**: Smart selection expansion for debugger code
- **Linked Editing**: Simultaneously edit related debugger identifiers
- **Color Provider**: Visual severity indicators for diagnostics

#### **Diagnostics & Validation**
- **Infinite Loop Detection**: Warns about `while(true)` patterns with hang detection suggestions
- **Missing Error Handling**: Suggests try-catch for operations like JSON.parse
- **Console.log Hints**: Recommends using breakpoints instead of console.log for debugging
- **Real-time Validation**: Instant feedback as you type

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

### LSP Commands (Available via MCP Protocol)

| Command | Description |
|---------|-------------|
| `mcp.debugger.start` | Start debug session via MCP |
| `mcp.debugger.setBreakpoint` | Set breakpoint via MCP |
| `mcp.debugger.continue` | Resume execution |
| `mcp.debugger.stepOver` | Step over current line |
| `mcp.debugger.stepInto` | Step into function |
| `mcp.debugger.stepOut` | Step out of function |
| `mcp.debugger.pause` | Pause execution |
| `mcp.debugger.inspect` | Inspect variable |
| `mcp.debugger.getStack` | Get call stack |
| `mcp.debugger.detectHang` | Detect hanging process |
| `mcp.debugger.profileCPU` | Start CPU profiling |
| `mcp.debugger.profileMemory` | Take memory snapshot |

## LSP Features in Action

### Code Lens Breakpoint Suggestions

The extension automatically suggests breakpoints at strategic locations:

```javascript
function processData(items) {  // 🔴 Set Breakpoint
  for (let i = 0; i < items.length; i++) {  // 🔍 Debug Loop
    try {
      const result = transform(items[i]);
      results.push(result);
    } catch (error) {  // ⚠️ Debug Error Handler
      console.error(error);
    }
  }
}
```

### Signature Help

Get real-time parameter hints as you type:

```javascript
debugger_start(
  // ↓ Shows: command: string, args?: string[], cwd?: string, timeout?: number
  'node',
  ['app.js'],
  '/path/to/project',
  30000
);
```

### Inlay Hints

See return types inline:

```javascript
const session = debugger_start('node', ['test.js']);  // → session-id
const bp = debugger_set_breakpoint(session, 'test.js', 10);  // → breakpoint-id
const value = debugger_inspect(session, 'user.age');  // → number
```

### Code Actions

Quick fixes appear automatically:

```javascript
// Before: console.log statement with hint
console.log(user.name);  // 💡 Consider using breakpoints instead

// Quick Fix 1: Convert to breakpoint
// Watch: user.name
debugger; // Breakpoint - inspect user.name

// Quick Fix 2: Remove console.log
// (statement removed)
```

### Diagnostics

Real-time warnings and suggestions:

```javascript
// ⚠️ Warning: Potential infinite loop detected
while (true) {
  // Consider using hang detection
}

// ℹ️ Info: Consider wrapping in try-catch
const data = JSON.parse(input);
```

### Call Hierarchy

Visualize function dependencies:

```
debugger_continue
  ↓ depends on
  debugger_set_breakpoint
    ↓ depends on
    debugger_start
```

### Type Hierarchy

Explore type relationships:

```
Object
  ├── Breakpoint
  ├── StackFrame
  └── Variable

EventEmitter
  └── DebugSession
```

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

## LSP Features for AI Agents

The Language Server Protocol integration enables AI agents to:

### 1. **Understand Code Context**
- Access document symbols to identify debug sessions and breakpoints
- Use semantic tokens to understand debugger-specific syntax
- Navigate type hierarchies to understand debugger data structures

### 2. **Provide Intelligent Suggestions**
- Suggest breakpoints at optimal locations using code lens
- Recommend quick fixes for common debugging patterns
- Offer signature help for correct debugger function usage

### 3. **Validate Code**
- Detect infinite loops and suggest hang detection
- Identify missing error handling
- Warn about inefficient debugging practices (console.log)

### 4. **Navigate Code**
- Use call hierarchy to understand debugger function dependencies
- Follow document links to relevant documentation
- Navigate type hierarchies for debugger types

### Example: AI Agent Using LSP Features

```javascript
// AI agent analyzes code using LSP
// 1. Gets document symbols → finds existing breakpoints
// 2. Uses call hierarchy → understands function dependencies
// 3. Checks diagnostics → identifies infinite loop warning
// 4. Suggests code action → adds hang detection
// 5. Provides signature help → shows correct parameters

// AI's suggestion:
const session = debugger_start('node', ['app.js'], process.cwd(), 30000);
const result = debugger_detect_hang('node', ['app.js'], 5000, 100);
if (result.hung) {
  console.log(`Hang detected at ${result.location}`);
}
```

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

### 1.5.0

Major LSP update:
- **13 new LSP features** for enhanced code intelligence
- **Code Actions**: Convert console.log to breakpoints, add try-catch, remove logging
- **Signature Help**: Real-time parameter hints for all debugger functions
- **Inlay Hints**: Inline type annotations for return values
- **Document Symbols**: Outline view for debug sessions and breakpoints
- **Semantic Tokens**: Syntax highlighting for debugger code
- **Call Hierarchy**: Visualize function dependencies
- **Type Hierarchy**: Explore debugger type relationships
- **Diagnostics**: Real-time validation with infinite loop detection
- **Code Lens**: Inline breakpoint suggestions
- **Document Links**: Quick access to documentation
- **Folding Ranges**: Collapse/expand debug blocks
- **Selection Ranges**: Smart selection expansion
- **Linked Editing**: Simultaneous identifier editing
- **Color Provider**: Visual severity indicators
- **80+ comprehensive tests** for LSP features
- **E2E testing** for all LSP capabilities

### 1.0.0

Initial release:
- Advanced debugging with MCP integration
- Hang detection
- CPU and memory profiling
- Smart breakpoint suggestions
- GitHub Copilot integration
- Test framework support (Jest, Mocha, Vitest)

## Contributing

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/Digital-Defiance/vscode-mcp-debugger/issues).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## More Information

- [VS Code MCP Debugger Documentation](https://github.com/Digital-Defiance/vscode-mcp-debugger)
- [MCP Debugger Server Documentation](https://github.com/Digital-Defiance/mcp-debugger-server)
- [MCP Debugger Core Documentation](https://github.com/Digital-Defiance/mcp-debugger-core)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

---

**Enjoy debugging with AI! 🚀**
