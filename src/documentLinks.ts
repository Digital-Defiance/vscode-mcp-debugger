import { DocumentLink, Range } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

const DOCS_BASE = "https://github.com/Digital-Defiance/ai-capabilities-suite/blob/main/packages/mcp-debugger-server";

/**
 * Provide document links for debugger code
 */
export function getDocumentLinks(document: TextDocument): DocumentLink[] {
  const links: DocumentLink[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  const functionDocs: Record<string, string> = {
    debugger_start: `${DOCS_BASE}/TOOL-REFERENCE.md#1-debugger_start`,
    debugger_stop_session: `${DOCS_BASE}/TOOL-REFERENCE.md#2-debugger_stop_session`,
    debugger_set_breakpoint: `${DOCS_BASE}/TOOL-REFERENCE.md#3-debugger_set_breakpoint`,
    debugger_continue: `${DOCS_BASE}/TOOL-REFERENCE.md#7-debugger_continue`,
    debugger_step_over: `${DOCS_BASE}/TOOL-REFERENCE.md#8-debugger_step_over`,
    debugger_step_into: `${DOCS_BASE}/TOOL-REFERENCE.md#9-debugger_step_into`,
    debugger_step_out: `${DOCS_BASE}/TOOL-REFERENCE.md#10-debugger_step_out`,
    debugger_pause: `${DOCS_BASE}/TOOL-REFERENCE.md#11-debugger_pause`,
    debugger_inspect: `${DOCS_BASE}/TOOL-REFERENCE.md#12-debugger_inspect`,
    debugger_get_stack: `${DOCS_BASE}/TOOL-REFERENCE.md#19-debugger_get_stack`,
    debugger_detect_hang: `${DOCS_BASE}/TOOL-REFERENCE.md#21-debugger_detect_hang`,
  };

  lines.forEach((line, lineIndex) => {
    Object.entries(functionDocs).forEach(([func, url]) => {
      const index = line.indexOf(func);
      if (index !== -1) {
        links.push({
          range: Range.create(lineIndex, index, lineIndex, index + func.length),
          target: url,
          tooltip: `View ${func} documentation`,
        });
      }
    });
  });

  return links;
}
