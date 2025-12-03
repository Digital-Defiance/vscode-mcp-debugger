# GitHub Copilot Integration Guide

## Using MCP Debugger with GitHub Copilot

This guide shows you how to use the MCP Debugger extension with GitHub Copilot for AI-assisted debugging.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Basic Usage](#basic-usage)
- [Debugging Workflows](#debugging-workflows)
- [Example Conversations](#example-conversations)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **VS Code**: Version 1.85.0 or higher
- **Node.js**: Version 16.x or higher
- **GitHub Copilot**: Active subscription and extension installed
- **MCP Debugger Extension**: Installed and configured

## Setup

### 1. Install GitHub Copilot

If you haven't already:

1. Install the GitHub Copilot extension from the VS Code marketplace
2. Sign in with your GitHub account
3. Verify Copilot is active (check status bar)

### 2. Configure MCP Server

Add the MCP Debugger server to your workspace settings (`.vscode/settings.json`):

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-debugger-server/dist/src/index.js"],
      "transport": "stdio"
    }
  }
}
```

Or use the global MCP server if installed:

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "npx",
      "args": ["@ai-capabilities-suite/mcp-debugger-server"],
      "transport": "stdio"
    }
  }
}
```

### 3. Enable Copilot MCP Integration

Add to your settings:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "enabled": true,
      "servers": ["debugger"]
    }
  }
}
```

### 4. Verify Setup

1. Open Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)
2. Ask: "What debugging tools are available?"
3. Copilot should list the MCP debugger tools

## Basic Usage

### Starting a Debug Session

**Ask Copilot:**
```
Debug the current file
```

**What Copilot Does:**
1. Starts a debug session with the current file
2. Pauses at the first line
3. Shows you the session ID

### Setting Breakpoints

**Ask Copilot:**
```
Set a breakpoint at line 42 in app.js
```

**What Copilot Does:**
1. Sets a breakpoint at the specified location
2. Verifies the breakpoint is set correctly
3. Confirms with you

### Inspecting Variables

**Ask Copilot:**
```
What is the value of the user variable?
```

**What Copilot Does:**
1. Evaluates the expression in the current context
2. Returns the value and type
3. Explains what it means

### Finding Bugs

**Ask Copilot:**
```
Find the bug in this function
```

**What Copilot Does:**
1. Analyzes the code
2. Starts a debug session
3. Sets strategic breakpoints
4. Steps through the code
5. Inspects variables
6. Identifies the issue
7. Explains what's wrong
8. Suggests a fix

## Debugging Workflows

### Workflow 1: Debug a Crashing Script

**Scenario:** Your script crashes with an error.

**Steps:**

1. Open the file in VS Code
2. Open Copilot Chat
3. Ask: "Debug this file and tell me why it's crashing"

**Example Conversation:**

```
You: Debug this file and tell me why it's crashing

Copilot: I'll debug the file for you. Let me start a debug session.

[Copilot starts debug session]

Copilot: I've started debugging app.js. Let me set a breakpoint at the 
suspected location and inspect the variables.

[Copilot sets breakpoint and continues]

Copilot: I found the issue! At line 25, the 'user' variable is undefined. 
This is causing the crash when you try to access user.name on line 26.

The problem is that the getUserById function returns null when the user 
is not found, but your code doesn't check for this before accessing 
properties.

Here's the fix:

```javascript
const user = getUserById(userId);
if (!user) {
  console.error('User not found');
  return;
}
console.log(user.name);
```

Would you like me to apply this fix?
```

### Workflow 2: Detect an Infinite Loop

**Scenario:** Your script seems to hang.

**Steps:**

1. Open the file
2. Ask Copilot: "Check if this script has an infinite loop"

**Example Conversation:**

```
You: Check if this script has an infinite loop

Copilot: I'll use hang detection to check for infinite loops.

[Copilot uses debugger_detect_hang]

Copilot: Yes, I detected an infinite loop at line 78 in process-data.js.

The loop condition is:
```javascript
while (i < items.length) {
  processItem(items[i]);
  // Missing: i++
}
```

The problem is that 'i' is never incremented, so the loop never exits.

Fix: Add `i++` inside the loop:
```javascript
while (i < items.length) {
  processItem(items[i]);
  i++;
}
```
```

### Workflow 3: Understand Complex Logic

**Scenario:** You want to understand how a function works.

**Steps:**

1. Select the function
2. Ask: "Step through this function and explain how it works"

**Example Conversation:**

```
You: Step through this function and explain how it works

Copilot: I'll step through the calculateDiscount function and explain 
each step.

[Copilot starts debug session and steps through]

Copilot: Here's how the function executes:

1. Line 15: Initializes basePrice = 100
2. Line 16: Gets discountPercent = 20 from the user object
3. Line 17: Calculates discount = 20 (20% of 100)
4. Line 18: Calculates finalPrice = 80 (100 - 20)
5. Line 19: Returns 80

The function calculates a percentage discount and subtracts it from the 
base price. In this case, a 20% discount on $100 results in a final 
price of $80.
```

### Workflow 4: Debug a Failing Test

**Scenario:** A Jest test is failing.

**Steps:**

1. Open the test file
2. Ask: "Debug this failing test"

**Example Conversation:**

```
You: Debug this failing test

Copilot: I'll debug the test and find out why it's failing.

[Copilot starts debug session with Jest]

Copilot: I found the issue. The test is failing because:

Expected: "John"
Actual: "john"

The test is comparing user names, but the comparison is case-sensitive. 
The database returns "john" (lowercase), but the test expects "John" 
(capitalized).

You have two options:

1. Fix the test to expect lowercase:
```javascript
expect(user.name).toBe('john');
```

2. Fix the code to capitalize names:
```javascript
const name = dbUser.name.charAt(0).toUpperCase() + dbUser.name.slice(1);
```

Which approach would you prefer?
```

### Workflow 5: Track Variable Changes

**Scenario:** You want to see how a variable changes during execution.

**Steps:**

1. Open the file
2. Ask: "Track how the balance variable changes in this function"

**Example Conversation:**

```
You: Track how the balance variable changes in this function

Copilot: I'll set up a watch on the balance variable and track its changes.

[Copilot starts debug session and adds watch]

Copilot: Here's how the balance changes:

1. Line 20: balance = 1000 (initial value)
2. Line 35: balance = 900 (after withdrawal of 100)
3. Line 50: balance = 1150 (after deposit of 250)
4. Line 65: balance = 1150 (no change, validation failed)

The balance starts at $1000, decreases to $900 after a withdrawal, 
then increases to $1150 after a deposit. The final attempted transaction 
was rejected due to validation, so the balance remained at $1150.
```

## Example Conversations

### Example 1: Quick Bug Fix

```
You: Why does this function return undefined?

Copilot: Let me debug it and find out.

[Debugs the function]

Copilot: The function returns undefined because there's no return 
statement in the else branch. When the condition is false, the function 
doesn't return anything, which defaults to undefined.

Add a return statement:
```javascript
if (condition) {
  return value;
} else {
  return defaultValue; // Add this
}
```
```

### Example 2: Performance Issue

```
You: Why is this function so slow?

Copilot: I'll profile the function to identify bottlenecks.

[Starts profiling]

Copilot: The function is slow because of the nested loop at lines 42-48. 
For each item in the outer loop (1000 items), you're iterating through 
all items again in the inner loop (1000 items), resulting in 1,000,000 
iterations.

Optimization: Use a Map for O(1) lookups instead of nested loops:

```javascript
const itemMap = new Map(items.map(item => [item.id, item]));
for (const item of items) {
  const related = itemMap.get(item.relatedId);
  // Process related item
}
```

This reduces complexity from O(n²) to O(n).
```

### Example 3: TypeScript Debugging

```
You: Debug this TypeScript file

Copilot: I'll debug the TypeScript file using source maps.

[Starts debug session with source maps]

Copilot: I'm debugging the TypeScript source (not the compiled JavaScript). 
The issue is at line 42 in app.ts:

```typescript
const user: User = getUser(id);
console.log(user.name); // Error: user might be null
```

TypeScript shows that getUser can return null, but you're not checking 
for it. Use optional chaining:

```typescript
const user: User | null = getUser(id);
console.log(user?.name ?? 'Unknown');
```
```

## Tips and Best Practices

### 1. Be Specific

❌ Bad: "Debug this"
✅ Good: "Debug this function and tell me why it returns null"

### 2. Provide Context

❌ Bad: "Find the bug"
✅ Good: "Find the bug that causes the user login to fail"

### 3. Ask for Explanations

✅ "Explain why this variable is undefined"
✅ "Show me the execution path that leads to this error"
✅ "What happens when this condition is false?"

### 4. Use Selection

1. Select the code you want to debug
2. Ask: "Debug this selection"
3. Copilot will focus on the selected code

### 5. Iterate

If Copilot's first attempt doesn't find the issue:
- Ask follow-up questions
- Request more detailed inspection
- Ask to check specific variables

### 6. Cleanup

Copilot automatically cleans up debug sessions, but you can also:
- Ask: "Stop the debug session"
- Ask: "Clean up all debug sessions"

## Troubleshooting

### Issue: Copilot Doesn't See Debugging Tools

**Symptoms:**
- Copilot says "I don't have debugging tools"
- Copilot can't start debug sessions

**Solutions:**

1. **Check MCP Configuration:**
   ```json
   {
     "mcp.servers": {
       "debugger": {
         "command": "node",
         "args": ["path/to/mcp-server/dist/index.js"]
       }
     }
   }
   ```

2. **Enable Copilot MCP:**
   ```json
   {
     "github.copilot.advanced": {
       "mcp": {
         "enabled": true,
         "servers": ["debugger"]
       }
     }
   }
   ```

3. **Restart VS Code**

4. **Verify Setup:**
   - Ask Copilot: "What debugging tools are available?"
   - Should list debugger tools

### Issue: Debug Sessions Fail to Start

**Symptoms:**
- Copilot says "Failed to start debug session"
- Error messages about missing files

**Solutions:**

1. **Check File Paths:**
   - Use absolute paths
   - Verify files exist

2. **Check Node.js:**
   ```bash
   node --version  # Should be 16.x or higher
   ```

3. **Check MCP Server:**
   ```bash
   node path/to/mcp-server/dist/index.js
   # Should start without errors
   ```

4. **Check Logs:**
   - View → Output → MCP Debugger
   - Look for error messages

### Issue: Breakpoints Not Hitting

**Symptoms:**
- Copilot sets breakpoints but they don't pause execution
- Code runs without stopping

**Solutions:**

1. **Check File Paths:**
   - Ensure paths are absolute
   - Verify file names match exactly

2. **Check Line Numbers:**
   - Ensure line has executable code
   - Try adjacent lines

3. **Check Source Maps (TypeScript):**
   - Ensure source maps are generated
   - Use `--enable-source-maps` flag

4. **Verify Breakpoint:**
   - Ask Copilot: "List all breakpoints"
   - Check if breakpoint is verified

### Issue: Variables Show as Undefined

**Symptoms:**
- Copilot says variables are undefined
- Can't inspect variable values

**Solutions:**

1. **Check Execution State:**
   - Ensure process is paused
   - Ask: "Is the debug session paused?"

2. **Check Scope:**
   - Variable might be out of scope
   - Ask: "What variables are in scope?"

3. **Check Stack Frame:**
   - Might be in wrong stack frame
   - Ask: "Show me the call stack"

4. **Check Spelling:**
   - Variable name might be misspelled
   - Ask: "List all local variables"

### Issue: Copilot Takes Too Long

**Symptoms:**
- Copilot doesn't respond
- Operations timeout

**Solutions:**

1. **Increase Timeout:**
   ```json
   {
     "mcp-debugger.defaultTimeout": 60000
   }
   ```

2. **Simplify Request:**
   - Break complex requests into steps
   - Ask for one thing at a time

3. **Check Process:**
   - Ensure target process isn't actually hanging
   - Use hang detection first

4. **Restart:**
   - Restart VS Code
   - Restart MCP server

## Advanced Usage

### Custom Debugging Workflows

You can create custom workflows by chaining requests:

```
You: Debug this file, set breakpoints at lines 10, 20, and 30, then 
step through and show me the value of x at each breakpoint

Copilot: [Executes the workflow step by step]
```

### Conditional Debugging

```
You: Set a breakpoint at line 42 that only triggers when x > 10

Copilot: [Sets conditional breakpoint]
```

### Multi-File Debugging

```
You: Debug the interaction between app.js and utils.js

Copilot: [Sets breakpoints in both files and traces execution]
```

### Performance Profiling

```
You: Profile this function and show me where it spends the most time

Copilot: [Runs CPU profiling and analyzes results]
```

## Configuration Examples

### Minimal Configuration

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "npx",
      "args": ["@ai-capabilities-suite/mcp-debugger-server"]
    }
  }
}
```

### Full Configuration

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-debugger-server/dist/src/index.js"],
      "transport": "stdio",
      "env": {
        "NODE_ENV": "development"
      }
    }
  },
  "github.copilot.advanced": {
    "mcp": {
      "enabled": true,
      "servers": ["debugger"],
      "autoApprove": [
        "debugger_start",
        "debugger_set_breakpoint",
        "debugger_continue",
        "debugger_inspect"
      ]
    }
  },
  "mcp-debugger.defaultTimeout": 30000,
  "mcp-debugger.enableHangDetection": true,
  "mcp-debugger.hangDetectionTimeout": 5000
}
```

### TypeScript Project

```json
{
  "mcp.servers": {
    "debugger": {
      "command": "node",
      "args": [
        "--enable-source-maps",
        "${workspaceFolder}/node_modules/@ai-capabilities-suite/mcp-debugger-server/dist/src/index.js"
      ]
    }
  }
}
```

## See Also

- [README.md](README.md) - Extension overview
- [INSTALLATION.md](INSTALLATION.md) - Installation guide
- [VS Code Integration Guide](../mcp-debugger-server/VSCODE-INTEGRATION.md) - Detailed integration
- [AI Agent Integration Guide](../mcp-debugger-server/AI-AGENT-INTEGRATION.md) - AI agent details

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [GitHub Issues](https://github.com/yourusername/mcp-debugger/issues)
3. Ask Copilot: "Help me troubleshoot the MCP debugger"
4. Check the Output panel: View → Output → MCP Debugger

---

**Happy AI-Assisted Debugging! 🤖🐛**
