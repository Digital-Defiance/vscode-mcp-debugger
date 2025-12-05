# Change Log

All notable changes to the "MCP Debugger" extension will be documented in this file.

## [1.5.0] - 2025-01-XX

### Added - Language Server Protocol (LSP) Features

#### Code Intelligence
- **Hover Provider**: Hover over variables to see debugging instructions and inspection tips
- **Signature Help Provider**: Real-time parameter hints for all 12 debugger functions with full documentation
- **Inlay Hints Provider**: Inline type annotations showing return types (session-id, breakpoint-id, inferred types)
- **Document Symbols Provider**: Outline view displaying debug sessions, breakpoints, inspections, and hang detections
- **Semantic Tokens Provider**: Custom syntax highlighting for debugger functions and variables

#### Code Actions & Quick Fixes
- **Convert console.log to breakpoint**: Transform logging statements into breakpoints with watch expressions
- **Remove console.log**: Quick action to clean up debugging statements
- **Wrap in try-catch**: Automatically add error handling around risky operations (JSON.parse, etc.)
- **Add hang detection**: Insert hang detection comments for potential infinite loops

#### Navigation & Hierarchy
- **Call Hierarchy Provider**: Visualize debugger function dependencies and call relationships
  - Shows which functions depend on others (e.g., debugger_continue depends on debugger_set_breakpoint)
  - Helps understand debugging workflow requirements
- **Type Hierarchy Provider**: Explore debugger type relationships
  - Navigate from Object to Breakpoint, StackFrame, Variable
  - Navigate from EventEmitter to DebugSession
- **Document Links Provider**: Quick links to debugger documentation
- **Go to Definition**: Navigate to debugger function definitions

#### Code Editing Features
- **Folding Ranges Provider**: Collapse/expand debug session blocks for better code organization
- **Selection Ranges Provider**: Smart selection expansion for debugger code
- **Linked Editing Ranges Provider**: Simultaneously edit related debugger identifiers
- **Color Provider**: Visual severity indicators for diagnostics (red for errors, yellow for warnings)

#### Diagnostics & Validation
- **Infinite Loop Detection**: Real-time warnings for `while(true)` patterns with hang detection suggestions
- **Missing Error Handling**: Suggestions to add try-catch for operations like JSON.parse
- **Console.log Hints**: Recommendations to use breakpoints instead of console.log for debugging
- **Real-time Validation**: Instant feedback as you type with actionable suggestions

#### Code Lens
- **Function Breakpoints**: "🔴 Set Breakpoint" suggestions at function declarations
- **Loop Breakpoints**: "🔍 Debug Loop" suggestions at for/while/forEach loops
- **Error Handler Breakpoints**: "⚠️ Debug Error Handler" suggestions at catch blocks
- **One-click breakpoint setting**: Click code lens to set breakpoints instantly

### Testing
- **80+ comprehensive tests** for all LSP features
- **E2E testing suite** validating LSP protocol compliance
- **Unit tests** for each LSP provider (code actions, signature help, inlay hints, etc.)
- **Integration tests** for LSP feature interactions
- **Performance tests** ensuring sub-100ms response times

### Documentation
- Added comprehensive LSP features documentation to README
- Added "LSP Features in Action" section with visual examples
- Added "LSP Features for AI Agents" section explaining AI integration
- Updated examples to showcase LSP capabilities
- Added signature help documentation for all debugger functions

### Developer Experience
- **Improved code intelligence**: Better autocomplete and parameter hints
- **Faster debugging workflow**: Quick fixes and code actions reduce manual work
- **Better code navigation**: Call and type hierarchies make code exploration easier
- **Real-time feedback**: Diagnostics catch issues before runtime
- **AI-friendly**: LSP features enable better AI agent integration

## [1.0.0] - 2025-11-27

### Added
- Initial release of MCP Debugger for VS Code
- Advanced debugging with MCP integration
- Hang detection for infinite loops
- CPU profiling support
- Memory profiling with heap snapshots
- Smart breakpoint suggestions
- GitHub Copilot integration
- Support for Jest, Mocha, and Vitest test frameworks
- Conditional breakpoints
- Source map support for TypeScript
- Debug configuration provider
- Command palette commands for debugging operations
- Configurable settings for timeout, hang detection, and profiling

### Features
- **Smart Debugging**: AI-powered breakpoint suggestions
- **Hang Detection**: Automatically detect infinite loops and hanging processes
- **Performance Profiling**: CPU and memory profiling capabilities
- **Test Framework Support**: Debug Jest, Mocha, and Vitest tests
- **TypeScript Support**: Full source map integration
- **AI Integration**: Works with GitHub Copilot for enhanced debugging

### Commands
- `MCP Debugger: Start Debug Session` - Start debugging current file
- `MCP Debugger: Detect Hanging Process` - Detect infinite loops
- `MCP Debugger: Set Smart Breakpoint` - Set AI-suggested breakpoint
- `MCP Debugger: Start CPU Profiling` - Start CPU profiler
- `MCP Debugger: Take Heap Snapshot` - Take memory snapshot

### Configuration
- `mcp-debugger.serverPath` - Path to MCP debugger server
- `mcp-debugger.autoStart` - Auto-start MCP server
- `mcp-debugger.defaultTimeout` - Default timeout for operations
- `mcp-debugger.enableHangDetection` - Enable hang detection
- `mcp-debugger.hangDetectionTimeout` - Hang detection timeout
- `mcp-debugger.enableProfiling` - Enable profiling features
- `mcp-debugger.logLevel` - Log level

## [Unreleased]

### Planned
- Watch expressions
- Logpoints (non-breaking breakpoints)
- Exception breakpoints
- Multi-target debugging
- Remote debugging support
- Performance timeline visualization
- Memory leak detection UI
- Breakpoint hit count conditions
