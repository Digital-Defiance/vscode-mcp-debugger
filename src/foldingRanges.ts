import { FoldingRange, FoldingRangeKind } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

/**
 * Provide folding ranges for debugger code
 */
export function getFoldingRanges(document: TextDocument): FoldingRange[] {
  const ranges: FoldingRange[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  let debugSessionStart = -1;
  let tryBlockStart = -1;

  lines.forEach((line, index) => {
    // Fold debug sessions
    if (line.includes("debugger_start")) {
      debugSessionStart = index;
    } else if (debugSessionStart !== -1 && line.includes("debugger_stop_session")) {
      ranges.push({ startLine: debugSessionStart, endLine: index, kind: FoldingRangeKind.Region });
      debugSessionStart = -1;
    }

    // Fold try-catch blocks
    if (line.trim().startsWith("try")) {
      tryBlockStart = index;
    } else if (tryBlockStart !== -1 && line.trim().startsWith("}")) {
      ranges.push({ startLine: tryBlockStart, endLine: index });
      tryBlockStart = -1;
    }
  });

  return ranges;
}
