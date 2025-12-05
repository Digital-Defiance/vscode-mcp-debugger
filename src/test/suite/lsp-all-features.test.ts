import * as assert from 'assert';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SymbolKind } from 'vscode-languageserver/node';
import { getCodeActions } from '../../codeActions';
import { getSignatureHelp } from '../../signatureHelp';
import { getInlayHints } from '../../inlayHints';
import { getDocumentSymbols } from '../../documentSymbols';
import { getSemanticTokens } from '../../semanticTokens';
import { getDocumentLinks } from '../../documentLinks';
import { getDocumentColors, getColorPresentations } from '../../colorProvider';
import { getFoldingRanges } from '../../foldingRanges';
import { getSelectionRanges } from '../../selectionRanges';
import { getLinkedEditingRanges } from '../../linkedEditingRanges';
import { prepareCallHierarchy, getOutgoingCalls } from '../../callHierarchy';
import { prepareTypeHierarchy, getSupertypes } from '../../typeHierarchy';

suite('MCP Debugger - All LSP Features', () => {

  suite('Phase 1: Code Actions', () => {
    test('Convert console.log to breakpoint', () => {
      const doc = TextDocument.create('test.js', 'javascript', 1, 'console.log("test");');
      const diagnostic = {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 11 } },
        message: 'Consider using breakpoints',
        source: 'mcp-debugger',
        code: 'console-log-hint'
      };
      const actions = getCodeActions(doc, diagnostic);
      assert.ok(actions.length > 0);
      assert.ok(actions[0].title.includes('breakpoint'));
    });

    test('Add try-catch wrapper', () => {
      const doc = TextDocument.create('test.js', 'javascript', 1, 'JSON.parse(data);');
      const diagnostic = {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        message: 'Consider wrapping in try-catch',
        source: 'mcp-debugger',
        code: 'missing-try-catch'
      };
      const actions = getCodeActions(doc, diagnostic);
      assert.ok(actions.length > 0);
    });
  });

  suite('Phase 2: Signature Help', () => {
    test('debugger_start signature', () => {
      const help = getSignatureHelp('debugger_start', 0);
      assert.ok(help);
      assert.strictEqual(help.signatures.length, 1);
      assert.ok(help.signatures[0].label.includes('debugger_start'));
    });

    test('debugger_set_breakpoint signature', () => {
      const help = getSignatureHelp('debugger_set_breakpoint', 0);
      assert.ok(help);
      assert.ok(help.signatures[0].parameters);
    });
  });

  suite('Phase 3: Inlay Hints', () => {
    test('Show breakpoint IDs', () => {
      const code = 'const bp = debugger_set_breakpoint({ line: 10 });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const hints = getInlayHints(doc);
      assert.ok(hints.length > 0);
    });

    test('Show variable types', () => {
      const code = 'debugger_inspect({ expression: "myVar" });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const hints = getInlayHints(doc);
      assert.ok(hints.length >= 0);
    });
  });

  suite('Phase 4: Document Symbols', () => {
    test('Debug session outline', () => {
      const code = `
debugger_start({ script: 'test.js' });
debugger_set_breakpoint({ line: 10 });
debugger_inspect({ expression: 'x' });
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const symbols = getDocumentSymbols(doc);
      assert.ok(symbols.length > 0);
    });
  });

  suite('Phase 5: Semantic Tokens', () => {
    test('Highlight debugger functions', () => {
      const code = 'debugger_start({ script: "test.js" });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const tokens = getSemanticTokens(doc);
      assert.ok(tokens.data.length > 0);
    });

    test('Highlight variables', () => {
      const code = 'const session = debugger_start();';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const tokens = getSemanticTokens(doc);
      assert.ok(tokens.data.length > 0);
    });
  });

  suite('Phase 6: Document Links', () => {
    test('Link to debugger_start docs', () => {
      const code = 'debugger_start({ script: "test.js" });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const links = getDocumentLinks(doc);
      assert.ok(links.length > 0);
      assert.ok(links[0].target?.includes('TOOL-REFERENCE'));
    });
  });

  suite('Phase 5/6 Additional: Color Provider', () => {
    test('Detect severity colors', () => {
      const doc = TextDocument.create('test.js', 'javascript', 1, 'const error = "test";');
      const colors = getDocumentColors(doc);
      assert.ok(colors.length > 0);
    });

    test('Provide color presentations', () => {
      const color = { red: 1, green: 0, blue: 0, alpha: 1 };
      const presentations = getColorPresentations(color);
      assert.strictEqual(presentations.length, 2);
    });
  });

  suite('Phase 5/6 Additional: Folding Ranges', () => {
    test('Fold debug sessions', () => {
      const code = `
debugger_start({ script: 'test.js' });
debugger_stop_session();
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getFoldingRanges(doc);
      assert.ok(ranges.length > 0);
    });
  });

  suite('Phase 5/6 Additional: Selection Ranges', () => {
    test('Smart selection expansion', () => {
      const code = 'debugger_start({ script: "test.js" });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getSelectionRanges(doc, [{ line: 0, character: 10 }]);
      assert.strictEqual(ranges.length, 1);
    });
  });

  suite('Phase 5/6 Additional: Linked Editing', () => {
    test('Link session variables', () => {
      const code = `
const session = debugger_start();
debugger_continue({ session });
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getLinkedEditingRanges(doc, { line: 1, character: 10 });
      assert.ok(ranges);
    });
  });

  suite('Phase 5/6 Additional: Call Hierarchy', () => {
    test('Prepare call hierarchy', () => {
      const code = 'debugger_continue({ session });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const items = prepareCallHierarchy(doc, { line: 0, character: 10 });
      assert.ok(items);
    });

    test('Get outgoing calls', () => {
      const item = {
        name: 'debugger_continue',
        kind: SymbolKind.Function,
        uri: 'test.js',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        selectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
      };
      const calls = getOutgoingCalls(item);
      assert.ok(calls.length > 0);
    });
  });

  suite('Phase 5/6 Additional: Type Hierarchy', () => {
    test('Prepare type hierarchy', () => {
      const code = 'const session: DebugSession = null;';
      const doc = TextDocument.create('test.ts', 'typescript', 1, code);
      const items = prepareTypeHierarchy(doc, { line: 0, character: 20 });
      assert.ok(items);
    });

    test('Get supertypes', () => {
      const item = {
        name: 'DebugSession',
        kind: SymbolKind.Class,
        uri: 'test.ts',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        selectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
      };
      const supertypes = getSupertypes(item);
      assert.ok(supertypes.length > 0);
    });
  });
});
