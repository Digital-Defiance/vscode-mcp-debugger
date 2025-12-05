import {
  CodeAction,
  CodeActionKind,
  Diagnostic,
  TextEdit,
  WorkspaceEdit,
  Range,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Generate code actions for diagnostics
 */
export function getCodeActions(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction[] {
  const actions: CodeAction[] = [];

  switch (diagnostic.code) {
    case "console-log-hint":
      actions.push(convertConsoleLogToBreakpoint(document, diagnostic));
      actions.push(removeConsoleLog(document, diagnostic));
      break;
    case "missing-try-catch":
      actions.push(addTryCatchWrapper(document, diagnostic));
      break;
    case "infinite-loop-warning":
      actions.push(addConditionalBreakpoint(document, diagnostic));
      break;
  }

  return actions;
}

/**
 * Convert console.log to breakpoint + watch expression
 */
function convertConsoleLogToBreakpoint(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction {
  const line = document.getText(diagnostic.range);
  const match = line.match(/console\.log\(([^)]+)\)/);
  const expression = match ? match[1].trim() : "";

  const action: CodeAction = {
    title: "🔴 Convert to breakpoint + watch",
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [
          TextEdit.replace(
            diagnostic.range,
            `// Watch: ${expression}\ndebugger; // Breakpoint - inspect ${expression}`
          ),
        ],
      },
    },
  };

  return action;
}

/**
 * Remove console.log statement
 */
function removeConsoleLog(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction {
  const action: CodeAction = {
    title: "🗑️ Remove console.log",
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [TextEdit.del(diagnostic.range)],
      },
    },
  };

  return action;
}

/**
 * Add try-catch wrapper around statement
 */
function addTryCatchWrapper(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction {
  const line = document.getText(diagnostic.range);
  const indent = line.match(/^(\s*)/)?.[1] || "";
  const statement = line.trim();

  const wrapped = `${indent}try {\n${indent}  ${statement}\n${indent}} catch (error) {\n${indent}  console.error('Parse error:', error);\n${indent}}`;

  const action: CodeAction = {
    title: "🛡️ Wrap in try-catch",
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [TextEdit.replace(diagnostic.range, wrapped)],
      },
    },
  };

  return action;
}

/**
 * Add conditional breakpoint for loop
 */
function addConditionalBreakpoint(
  document: TextDocument,
  diagnostic: Diagnostic
): CodeAction {
  const line = document.getText(diagnostic.range);
  const indent = line.match(/^(\s*)/)?.[1] || "";

  const action: CodeAction = {
    title: "🔍 Add hang detection",
    kind: CodeActionKind.QuickFix,
    diagnostics: [diagnostic],
    edit: {
      changes: {
        [document.uri]: [
          TextEdit.insert(
            { line: diagnostic.range.start.line, character: 0 },
            `${indent}// TODO: Add hang detection with debugger_detect_hang\n`
          ),
        ],
      },
    },
  };

  return action;
}
