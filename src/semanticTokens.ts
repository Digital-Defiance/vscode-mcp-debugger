import {
  SemanticTokensBuilder,
  SemanticTokens,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

export const tokenTypes = ["function", "variable", "parameter"];
export const tokenModifiers = ["declaration", "readonly"];

/**
 * Provide semantic tokens for debugger code
 */
export function getSemanticTokens(document: TextDocument): SemanticTokens {
  const builder = new SemanticTokensBuilder();
  const text = document.getText();
  const lines = text.split("\n");

  lines.forEach((line, lineIndex) => {
    // Highlight debugger functions
    const funcMatch = line.match(/\b(debugger_\w+)\b/g);
    if (funcMatch) {
      funcMatch.forEach((func) => {
        const index = line.indexOf(func);
        if (index !== -1) {
          builder.push(lineIndex, index, func.length, 0, 0); // function token
        }
      });
    }

    // Highlight session/breakpoint variables
    const varMatch = line.match(/\b(session|breakpoint|bp)\b/g);
    if (varMatch) {
      varMatch.forEach((v) => {
        const index = line.indexOf(v);
        if (index !== -1) {
          builder.push(lineIndex, index, v.length, 1, 0); // variable token
        }
      });
    }
  });

  return builder.build();
}
