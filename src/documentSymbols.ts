import {
  DocumentSymbol,
  SymbolKind,
  Range,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Provide document symbols for debugger code
 */
export function getDocumentSymbols(document: TextDocument): DocumentSymbol[] {
  const symbols: DocumentSymbol[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    const range = Range.create(lineIndex, 0, lineIndex, line.length);

    // Debug sessions
    if (line.includes("debugger_start")) {
      symbols.push({
        name: "Debug Session",
        kind: SymbolKind.Function,
        range,
        selectionRange: range,
      });
    }

    // Breakpoints
    if (line.includes("debugger_set_breakpoint")) {
      symbols.push({
        name: "Breakpoint",
        kind: SymbolKind.Event,
        range,
        selectionRange: range,
      });
    }

    // Inspections
    if (line.includes("debugger_inspect")) {
      symbols.push({
        name: "Inspect Variable",
        kind: SymbolKind.Variable,
        range,
        selectionRange: range,
      });
    }

    // Hang detection
    if (line.includes("debugger_detect_hang")) {
      symbols.push({
        name: "Hang Detection",
        kind: SymbolKind.Method,
        range,
        selectionRange: range,
      });
    }
  });

  return symbols;
}
