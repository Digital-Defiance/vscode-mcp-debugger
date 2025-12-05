import {
  InlayHint,
  InlayHintKind,
  Position,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Provide inlay hints for debugger code
 */
export function getInlayHints(document: TextDocument): InlayHint[] {
  const hints: InlayHint[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    // Show breakpoint IDs
    const bpMatch = line.match(/debugger_set_breakpoint\s*\([^)]*\)/);
    if (bpMatch) {
      hints.push({
        position: Position.create(lineIndex, line.length),
        label: " → breakpoint-id",
        kind: InlayHintKind.Type,
        paddingLeft: true,
      });
    }

    // Show session IDs
    const sessionMatch = line.match(/debugger_start\s*\([^)]*\)/);
    if (sessionMatch) {
      hints.push({
        position: Position.create(lineIndex, line.length),
        label: " → session-id",
        kind: InlayHintKind.Type,
        paddingLeft: true,
      });
    }

    // Show variable types for inspect calls
    const inspectMatch = line.match(/debugger_inspect\s*\([^,]+,\s*['"]([^'"]+)['"]/);
    if (inspectMatch) {
      const expr = inspectMatch[1];
      hints.push({
        position: Position.create(lineIndex, line.length),
        label: ` → ${inferType(expr)}`,
        kind: InlayHintKind.Type,
        paddingLeft: true,
      });
    }
  });

  return hints;
}

function inferType(expression: string): string {
  if (expression.includes(".length")) return "number";
  if (expression.includes(".toString()")) return "string";
  if (expression.includes(" + ")) return "string | number";
  if (expression.includes(" > ") || expression.includes(" < ")) return "boolean";
  return "any";
}
