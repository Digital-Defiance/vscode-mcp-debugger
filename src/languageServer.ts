import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Hover,
  CodeLens,
  Command,
  Diagnostic,
  DiagnosticSeverity,
  ExecuteCommandParams,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion
      completionProvider: {
        resolveProvider: true,
      },
      // Hover provider for variable inspection
      hoverProvider: true,
      // Code lens for breakpoint suggestions
      codeLensProvider: {
        resolveProvider: true,
      },
      // Execute command provider for MCP tools
      executeCommandProvider: {
        commands: [
          "mcp.debugger.start",
          "mcp.debugger.setBreakpoint",
          "mcp.debugger.continue",
          "mcp.debugger.stepOver",
          "mcp.debugger.stepInto",
          "mcp.debugger.stepOut",
          "mcp.debugger.pause",
          "mcp.debugger.inspect",
          "mcp.debugger.getStack",
          "mcp.debugger.detectHang",
          "mcp.debugger.profileCPU",
          "mcp.debugger.profileMemory",
        ],
      },
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event: any) => {
      connection.console.log("Workspace folder change event received.");
    });
  }

  connection.console.log("MCP Debugger Language Server initialized");
  // Note: MCP client is managed by the main extension, not the language server
});

// Document lifecycle events
documents.onDidOpen((event: any) => {
  connection.console.log(`Document opened: ${event.document.uri}`);
  validateTextDocument(event.document);
});

documents.onDidChangeContent((change: any) => {
  validateTextDocument(change.document);
});

documents.onDidClose((event: any) => {
  connection.console.log(`Document closed: ${event.document.uri}`);
  // Clear diagnostics for closed document
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // Validate document for potential debugging issues
  const diagnostics: Diagnostic[] = [];
  const text = textDocument.getText();
  const lines = text.split("\n");

  // Check for common debugging issues
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect infinite loops
    if (line.includes("while(true)") || line.includes("while (true)")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        message:
          "Potential infinite loop detected. Consider using hang detection.",
        source: "mcp-debugger",
      });
    }

    // Detect missing error handling
    if (line.includes("JSON.parse(") && !lines[i - 1]?.includes("try")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Information,
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        message:
          "Consider wrapping JSON.parse in try-catch for error handling.",
        source: "mcp-debugger",
      });
    }

    // Detect console.log (suggest using debugger instead)
    if (line.includes("console.log(")) {
      diagnostics.push({
        severity: DiagnosticSeverity.Hint,
        range: {
          start: { line: i, character: line.indexOf("console.log") },
          end: {
            line: i,
            character: line.indexOf("console.log") + "console.log".length,
          },
        },
        message:
          "Consider using breakpoints instead of console.log for debugging.",
        source: "mcp-debugger",
      });
    }
  }

  // Send the computed diagnostics to VS Code
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change: any) => {
  // Monitored files have changed in VS Code
  connection.console.log("We received a file change event");
});

// Provide hover information for variables
connection.onHover(
  async (params: TextDocumentPositionParams): Promise<Hover | null> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return null;
    }

    // Get the word at the cursor position
    const text = document.getText();
    const offset = document.offsetAt(params.position);
    const wordRange = getWordRangeAtPosition(text, offset);

    if (!wordRange) {
      return null;
    }

    const word = text.substring(wordRange.start, wordRange.end);

    // Provide debugging instructions
    return {
      contents: {
        kind: "markdown",
        value: [
          `**Variable: ${word}**`,
          "",
          "To inspect this variable:",
          "1. Start a debug session",
          "2. Set a breakpoint on this line",
          "3. Use the debugger to inspect the value",
          "",
          "Or use the command: `MCP Debugger: Inspect Variable`",
        ].join("\n"),
      },
    };
  }
);

// Provide code lens for breakpoint suggestions
connection.onCodeLens(async (params: any): Promise<CodeLens[]> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  const codeLenses: CodeLens[] = [];
  const text = document.getText();
  const lines = text.split("\n");

  // Suggest breakpoints at function declarations
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function declarations
    if (
      line.includes("function ") ||
      (line.includes("const ") && line.includes("=>")) ||
      line.includes("async ")
    ) {
      codeLenses.push({
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        command: {
          title: "🔴 Set Breakpoint",
          command: "mcp.debugger.setBreakpoint",
          arguments: [params.textDocument.uri, i + 1],
        },
      });
    }

    // Detect loops (good places for breakpoints)
    if (
      line.includes("for (") ||
      line.includes("while (") ||
      line.includes("forEach(")
    ) {
      codeLenses.push({
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        command: {
          title: "🔍 Debug Loop",
          command: "mcp.debugger.setBreakpoint",
          arguments: [params.textDocument.uri, i + 1],
        },
      });
    }

    // Detect error handling
    if (line.includes("catch (")) {
      codeLenses.push({
        range: {
          start: { line: i, character: 0 },
          end: { line: i, character: line.length },
        },
        command: {
          title: "⚠️ Debug Error Handler",
          command: "mcp.debugger.setBreakpoint",
          arguments: [params.textDocument.uri, i + 1],
        },
      });
    }
  }

  return codeLenses;
});

// Execute commands from AI agents or UI
// Note: These commands are registered but actual execution happens in the main extension
// The language server just provides the command definitions for LSP clients
connection.onExecuteCommand(
  async (params: ExecuteCommandParams): Promise<any> => {
    // Commands are handled by the main extension via VS Code's command system
    // This handler is here for LSP protocol compliance
    connection.console.log(`Command requested: ${params.command}`);
    return {
      message: "Command forwarded to extension",
      command: params.command,
    };
  }
);

// Helper function to get word range at position
function getWordRangeAtPosition(
  text: string,
  offset: number
): { start: number; end: number } | null {
  const wordPattern = /\b\w+\b/g;
  let match;

  while ((match = wordPattern.exec(text)) !== null) {
    if (match.index <= offset && offset <= match.index + match[0].length) {
      return {
        start: match.index,
        end: match.index + match[0].length,
      };
    }
  }

  return null;
}

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();
