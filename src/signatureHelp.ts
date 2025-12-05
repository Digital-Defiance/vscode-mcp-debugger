import {
  SignatureHelp,
  SignatureInformation,
  ParameterInformation,
  MarkupKind,
} from "vscode-languageserver/node";

/**
 * Get signature help for debugger functions
 */
export function getSignatureHelp(
  functionName: string,
  activeParameter: number
): SignatureHelp | null {
  const signatures = debuggerSignatures[functionName];
  if (!signatures) return null;

  return {
    signatures: [signatures],
    activeSignature: 0,
    activeParameter: Math.min(activeParameter, (signatures.parameters?.length || 1) - 1),
  };
}

const debuggerSignatures: Record<string, SignatureInformation> = {
  debugger_start: {
    label: "debugger_start(command: string, args?: string[], cwd?: string, timeout?: number)",
    documentation: {
      kind: MarkupKind.Markdown,
      value: "Start a new debug session with a Node.js process.\n\n**Returns:** `{ sessionId, state, pid }`",
    },
    parameters: [
      { label: "command", documentation: "Command to execute (e.g., 'node', 'npm')" },
      { label: "args?", documentation: "Command arguments (e.g., ['test.js'])" },
      { label: "cwd?", documentation: "Working directory for the process" },
      { label: "timeout?", documentation: "Timeout in milliseconds (default: 30000)" },
    ],
  },
  debugger_stop_session: {
    label: "debugger_stop_session(sessionId: string)",
    documentation: "Stop a debug session and cleanup resources.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_set_breakpoint: {
    label: "debugger_set_breakpoint(sessionId: string, file: string, line: number, condition?: string)",
    documentation: {
      kind: MarkupKind.Markdown,
      value: "Set a breakpoint at a specific file and line.\n\n**Example:** `condition: 'x > 10'`",
    },
    parameters: [
      { label: "sessionId", documentation: "The debug session ID" },
      { label: "file", documentation: "Absolute path to the file" },
      { label: "line", documentation: "Line number (1-indexed)" },
      { label: "condition?", documentation: "Optional condition (e.g., 'count > 100')" },
    ],
  },
  debugger_continue: {
    label: "debugger_continue(sessionId: string)",
    documentation: "Resume execution until next breakpoint or termination.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_step_over: {
    label: "debugger_step_over(sessionId: string)",
    documentation: "Execute current line and pause at next line in same scope.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_step_into: {
    label: "debugger_step_into(sessionId: string)",
    documentation: "Step into function calls.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_step_out: {
    label: "debugger_step_out(sessionId: string)",
    documentation: "Execute until current function returns.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_pause: {
    label: "debugger_pause(sessionId: string)",
    documentation: "Pause a running debug session.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_inspect: {
    label: "debugger_inspect(sessionId: string, expression: string)",
    documentation: {
      kind: MarkupKind.Markdown,
      value: "Evaluate a JavaScript expression.\n\n**Example:** `'user.name + \" \" + user.age'`",
    },
    parameters: [
      { label: "sessionId", documentation: "The debug session ID" },
      { label: "expression", documentation: "JavaScript expression to evaluate" },
    ],
  },
  debugger_get_stack: {
    label: "debugger_get_stack(sessionId: string)",
    documentation: "Get the current call stack with file locations.",
    parameters: [{ label: "sessionId", documentation: "The debug session ID" }],
  },
  debugger_detect_hang: {
    label: "debugger_detect_hang(command: string, args?: string[], timeout: number, sampleInterval?: number)",
    documentation: {
      kind: MarkupKind.Markdown,
      value: "Detect if a process hangs or enters an infinite loop.\n\n**Returns:** `{ hung, location?, stack?, duration }`",
    },
    parameters: [
      { label: "command", documentation: "Command to execute" },
      { label: "args?", documentation: "Command arguments" },
      { label: "timeout", documentation: "Timeout in milliseconds" },
      { label: "sampleInterval?", documentation: "Sample interval in ms (default: 100)" },
    ],
  },
};
