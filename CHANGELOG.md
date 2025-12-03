# Change Log

All notable changes to the "MCP Debugger" extension will be documented in this file.

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
