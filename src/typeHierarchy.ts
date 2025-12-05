import { TypeHierarchyItem, SymbolKind, Range } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Prepare type hierarchy for debugger types
 */
export function prepareTypeHierarchy(document: TextDocument, position: { line: number; character: number }): TypeHierarchyItem[] | null {
  const line = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line + 1, character: 0 } });
  
  // Detect debugger types
  const types = ["DebugSession", "Breakpoint", "StackFrame", "Variable"];
  
  for (const type of types) {
    if (line.includes(type)) {
      const start = line.indexOf(type);
      return [{
        name: type,
        kind: SymbolKind.Class,
        uri: document.uri,
        range: Range.create(position.line, start, position.line, start + type.length),
        selectionRange: Range.create(position.line, start, position.line, start + type.length),
      }];
    }
  }

  return null;
}

/**
 * Get supertypes
 */
export function getSupertypes(item: TypeHierarchyItem): TypeHierarchyItem[] {
  const hierarchy: Record<string, string> = {
    DebugSession: "EventEmitter",
    Breakpoint: "Object",
    StackFrame: "Object",
    Variable: "Object",
  };

  const parent = hierarchy[item.name];
  if (parent) {
    return [{
      name: parent,
      kind: SymbolKind.Class,
      uri: item.uri,
      range: item.range,
      selectionRange: item.selectionRange,
    }];
  }

  return [];
}

/**
 * Get subtypes
 */
export function getSubtypes(item: TypeHierarchyItem): TypeHierarchyItem[] {
  const hierarchy: Record<string, string[]> = {
    Object: ["Breakpoint", "StackFrame", "Variable"],
    EventEmitter: ["DebugSession"],
  };

  const children = hierarchy[item.name] || [];
  return children.map((child) => ({
    name: child,
    kind: SymbolKind.Class,
    uri: item.uri,
    range: item.range,
    selectionRange: item.selectionRange,
  }));
}
