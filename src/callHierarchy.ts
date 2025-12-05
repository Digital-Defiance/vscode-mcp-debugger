import { CallHierarchyItem, CallHierarchyIncomingCall, CallHierarchyOutgoingCall, SymbolKind, Range } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Prepare call hierarchy for debugger functions
 */
export function prepareCallHierarchy(document: TextDocument, position: { line: number; character: number }): CallHierarchyItem[] | null {
  const line = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line + 1, character: 0 } });
  
  const funcMatch = line.match(/\b(debugger_\w+)\b/);
  if (funcMatch) {
    const func = funcMatch[1];
    const start = line.indexOf(func);
    
    return [{
      name: func,
      kind: SymbolKind.Function,
      uri: document.uri,
      range: Range.create(position.line, start, position.line, start + func.length),
      selectionRange: Range.create(position.line, start, position.line, start + func.length),
    }];
  }

  return null;
}

/**
 * Get incoming calls
 */
export function getIncomingCalls(item: CallHierarchyItem): CallHierarchyIncomingCall[] {
  // Debugger functions are typically called from user code
  return [];
}

/**
 * Get outgoing calls
 */
export function getOutgoingCalls(item: CallHierarchyItem): CallHierarchyOutgoingCall[] {
  // Map debugger function dependencies
  const dependencies: Record<string, string[]> = {
    debugger_start: [],
    debugger_set_breakpoint: ["debugger_start"],
    debugger_continue: ["debugger_set_breakpoint"],
    debugger_step_over: ["debugger_set_breakpoint"],
    debugger_inspect: ["debugger_pause"],
  };

  const calls: CallHierarchyOutgoingCall[] = [];
  const deps = dependencies[item.name] || [];

  deps.forEach((dep) => {
    calls.push({
      to: {
        name: dep,
        kind: SymbolKind.Function,
        uri: item.uri,
        range: item.range,
        selectionRange: item.selectionRange,
      },
      fromRanges: [item.range],
    });
  });

  return calls;
}
