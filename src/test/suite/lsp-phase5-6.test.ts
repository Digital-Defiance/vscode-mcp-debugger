import * as assert from 'assert';
import { SymbolKind } from 'vscode-languageserver/node';
import { getDocumentColors, getColorPresentations } from '../../colorProvider';
import { getFoldingRanges } from '../../foldingRanges';
import { getSelectionRanges } from '../../selectionRanges';
import { getLinkedEditingRanges } from '../../linkedEditingRanges';
import { prepareCallHierarchy, getIncomingCalls, getOutgoingCalls } from '../../callHierarchy';
import { prepareTypeHierarchy, getSupertypes, getSubtypes } from '../../typeHierarchy';
import { TextDocument } from 'vscode-languageserver-textdocument';

suite('LSP Phase 5/6 Features - Debugger', () => {
  
  suite('Color Provider', () => {
    test('should detect error severity color', () => {
      const doc = TextDocument.create('test.js', 'javascript', 1, 'const error = "test";');
      const colors = getDocumentColors(doc);
      assert.ok(colors.length > 0);
      assert.strictEqual(colors[0].color.red, 1);
    });

    test('should detect warning severity color', () => {
      const doc = TextDocument.create('test.js', 'javascript', 1, 'const warning = "test";');
      const colors = getDocumentColors(doc);
      assert.ok(colors.length > 0);
      assert.strictEqual(colors[0].color.red, 1);
      assert.strictEqual(colors[0].color.green, 0.65);
    });

    test('should provide color presentations', () => {
      const color = { red: 1, green: 0, blue: 0, alpha: 1 };
      const presentations = getColorPresentations(color);
      assert.ok(presentations.length > 0);
      assert.ok(presentations[0].label.includes('255'));
    });
  });

  suite('Folding Ranges', () => {
    test('should fold debug session', () => {
      const code = `
debugger_start({ script: 'test.js' });
const bp = debugger_set_breakpoint({ line: 10 });
debugger_continue();
debugger_stop_session();
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getFoldingRanges(doc);
      assert.ok(ranges.length > 0);
    });

    test('should fold try-catch blocks', () => {
      const code = `
try {
  debugger_start({ script: 'test.js' });
} catch (err) {
  console.error(err);
}
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getFoldingRanges(doc);
      assert.ok(ranges.length > 0);
    });
  });

  suite('Selection Ranges', () => {
    test('should expand selection for debugger function', () => {
      const code = 'debugger_start({ script: "test.js" });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getSelectionRanges(doc, [{ line: 0, character: 10 }]);
      assert.strictEqual(ranges.length, 1);
      assert.ok(ranges[0].range);
    });

    test('should handle position without function', () => {
      const code = 'const x = 5;';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getSelectionRanges(doc, [{ line: 0, character: 5 }]);
      assert.strictEqual(ranges.length, 1);
    });
  });

  suite('Linked Editing Ranges', () => {
    test('should link session variable occurrences', () => {
      const code = `
const session = debugger_start({ script: 'test.js' });
debugger_set_breakpoint({ session, line: 10 });
debugger_continue({ session });
      `;
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getLinkedEditingRanges(doc, { line: 1, character: 10 });
      assert.ok(ranges);
      assert.ok(ranges.ranges.length > 1);
    });

    test('should return null for non-variable', () => {
      const code = 'const x = 5;';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const ranges = getLinkedEditingRanges(doc, { line: 0, character: 10 });
      assert.strictEqual(ranges, null);
    });
  });

  suite('Call Hierarchy', () => {
    test('should prepare call hierarchy for debugger function', () => {
      const code = 'debugger_continue({ session });';
      const doc = TextDocument.create('test.js', 'javascript', 1, code);
      const items = prepareCallHierarchy(doc, { line: 0, character: 10 });
      assert.ok(items);
      assert.strictEqual(items.length, 1);
      assert.strictEqual(items[0].name, 'debugger_continue');
    });

    test('should get outgoing calls for debugger_continue', () => {
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

    test('should return empty incoming calls', () => {
      const item = {
        name: 'debugger_start',
        kind: SymbolKind.Function,
        uri: 'test.js',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        selectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
      };
      const calls = getIncomingCalls(item);
      assert.strictEqual(calls.length, 0);
    });
  });

  suite('Type Hierarchy', () => {
    test('should prepare type hierarchy for DebugSession', () => {
      const code = 'const session: DebugSession = null;';
      const doc = TextDocument.create('test.ts', 'typescript', 1, code);
      const items = prepareTypeHierarchy(doc, { line: 0, character: 20 });
      assert.ok(items);
      assert.strictEqual(items.length, 1);
      assert.strictEqual(items[0].name, 'DebugSession');
    });

    test('should get supertypes for DebugSession', () => {
      const item = {
        name: 'DebugSession',
        kind: SymbolKind.Class,
        uri: 'test.ts',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        selectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
      };
      const supertypes = getSupertypes(item);
      assert.ok(supertypes.length > 0);
      assert.strictEqual(supertypes[0].name, 'EventEmitter');
    });

    test('should get subtypes for Object', () => {
      const item = {
        name: 'Object',
        kind: SymbolKind.Class,
        uri: 'test.ts',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
        selectionRange: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } }
      };
      const subtypes = getSubtypes(item);
      assert.ok(subtypes.length > 0);
    });
  });
});
