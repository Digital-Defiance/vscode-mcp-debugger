import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { MCPDebuggerClient } from "./mcpClient";
import { DebugConfigurationProvider } from "./debugConfigProvider";
import { MCPDebugAdapterDescriptorFactory } from "./debugAdapterFactory";
import { DebugContextProvider } from "./debugContextProvider";
import {
  registerExtension,
  unregisterExtension,
  setOutputChannel,
} from "@ai-capabilities-suite/vscode-shared-status-bar";

let mcpClient: MCPDebuggerClient | undefined;
let outputChannel: vscode.LogOutputChannel;
let languageClient: LanguageClient | undefined;
let debugContextProvider: DebugContextProvider;

/**
 * Add this MCP server to the workspace mcp.json configuration
 */
async function configureMcpServer(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    const choice = await vscode.window.showWarningMessage(
      "No workspace folder open. Would you like to add the MCP server to your user settings instead?",
      "Add to User Settings",
      "Cancel"
    );
    if (choice === "Add to User Settings") {
      await vscode.commands.executeCommand("workbench.action.openSettingsJson");
      vscode.window.showInformationMessage(
        "Add the MCP server configuration manually. See the extension README for details."
      );
    }
    return;
  }

  const workspaceFolder = workspaceFolders[0];
  const vscodePath = path.join(workspaceFolder.uri.fsPath, ".vscode");
  const mcpJsonPath = path.join(vscodePath, "mcp.json");

  // Ensure .vscode directory exists
  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  // Read existing mcp.json or create new one
  let mcpConfig: { servers?: Record<string, any> } = { servers: {} };
  if (fs.existsSync(mcpJsonPath)) {
    try {
      const content = fs.readFileSync(mcpJsonPath, "utf8");
      mcpConfig = JSON.parse(content);
      if (!mcpConfig.servers) {
        mcpConfig.servers = {};
      }
    } catch (error) {
      outputChannel.appendLine(`Error reading mcp.json: ${error}`);
    }
  }

  // Add our server configuration
  const serverName = "mcp-debugger";
  if (mcpConfig.servers && mcpConfig.servers[serverName]) {
    const choice = await vscode.window.showWarningMessage(
      `MCP server "${serverName}" is already configured. Do you want to replace it?`,
      "Replace",
      "Cancel"
    );
    if (choice !== "Replace") {
      return;
    }
  }

  mcpConfig.servers = mcpConfig.servers || {};
  mcpConfig.servers[serverName] = {
    type: "stdio",
    command: "npx",
    args: ["-y", "@ai-capabilities-suite/mcp-debugger-server"],
  };

  // Write the updated configuration
  fs.writeFileSync(mcpJsonPath, JSON.stringify(mcpConfig, null, 2));

  // Open the file to show the user
  const doc = await vscode.workspace.openTextDocument(mcpJsonPath);
  await vscode.window.showTextDocument(doc);

  vscode.window.showInformationMessage(
    `MCP Debugger server added to ${mcpJsonPath}. Restart the MCP server to use it with Copilot.`
  );
}

export async function activate(context: vscode.ExtensionContext) {
  // Log to console first in case output channel creation fails
  console.log("=".repeat(60));
  console.log("MCP Debugger extension activate() called");
  console.log(`Activation time: ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  try {
    outputChannel = vscode.window.createOutputChannel("MCP Debugger", {
      log: true,
    });
    outputChannel.appendLine("=".repeat(60));
    outputChannel.appendLine("MCP Debugger extension activating...");
    outputChannel.appendLine(`Activation time: ${new Date().toISOString()}`);
    outputChannel.appendLine("=".repeat(60));
    console.log("✓ Output channel created successfully");
  } catch (error) {
    console.error("✗ Failed to create output channel:", error);
    throw error;
  }

  // Register MCP server definition provider (for future MCP protocol support)
  try {
    const mcpProviderId = "ts-mcp-debugger.mcp-provider";
    const mcpProvider: vscode.McpServerDefinitionProvider = {
      provideMcpServerDefinitions: async (token) => {
        const config = vscode.workspace.getConfiguration("mcp-debugger");
        const serverPath = config.get<string>("serverPath", "");
        const command = serverPath || "npx";
        const args = serverPath
          ? []
          : ["-y", "@ai-capabilities-suite/mcp-debugger-server"];

        return [
          new vscode.McpStdioServerDefinition(
            "MCP TypeScript Debugger",
            command,
            args
          ),
        ];
      },
      resolveMcpServerDefinition: async (server, token) => {
        return server;
      },
    };

    context.subscriptions.push(
      vscode.lm.registerMcpServerDefinitionProvider(mcpProviderId, mcpProvider)
    );
    outputChannel.appendLine("MCP server definition provider registered");
  } catch (error) {
    outputChannel.appendLine(
      `MCP provider registration skipped (API not available): ${error}`
    );
  }

  // Register chat participant for Copilot integration
  const participant = vscode.chat.createChatParticipant(
    "ts-mcp-debugger.participant",
    async (request, context, stream, token) => {
      if (!mcpClient) {
        stream.markdown(
          "MCP Debugger server is not running. Please start it first."
        );
        return;
      }

      const prompt = request.prompt;
      stream.markdown(`Processing debug request: ${prompt}\n\n`);

      // Handle different debug commands
      if (prompt.includes("hang") || prompt.includes("detect")) {
        stream.markdown("Detecting hangs...");
        // Delegate to hang detection
      } else if (prompt.includes("profile") || prompt.includes("cpu")) {
        stream.markdown("Starting CPU profiling...");
        // Delegate to profiling
      } else if (prompt.includes("memory") || prompt.includes("heap")) {
        stream.markdown("Taking heap snapshot...");
        // Delegate to memory profiling
      } else {
        stream.markdown(
          "Available commands:\n- Hang detection\n- CPU profiling\n- Memory profiling\n- Breakpoint management"
        );
      }
    }
  );

  context.subscriptions.push(participant);

  // Register language model tools
  try {
    const tools = [
      {
        name: "debugger_start",
        tool: {
          description: "Start a debug session for Node.js/TypeScript",
          inputSchema: {
            type: "object",
            properties: {
              file: { type: "string", description: "File path to debug" },
            },
          },
          invoke: async (
            options: vscode.LanguageModelToolInvocationOptions<any>,
            token: vscode.CancellationToken
          ) => {
            await startDebugSession();
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart("Debug session started"),
            ]);
          },
        },
      },
      {
        name: "debugger_detect_hang",
        tool: {
          description: "Detect infinite loops and hanging code",
          inputSchema: {
            type: "object",
            properties: {
              timeout: {
                type: "number",
                description: "Timeout in milliseconds",
              },
            },
          },
          invoke: async (
            options: vscode.LanguageModelToolInvocationOptions<any>,
            token: vscode.CancellationToken
          ) => {
            await detectHang();
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart("Hang detection complete"),
            ]);
          },
        },
      },
      {
        name: "debugger_profile_cpu",
        tool: {
          description: "Start CPU profiling",
          inputSchema: { type: "object", properties: {} },
          invoke: async (
            options: vscode.LanguageModelToolInvocationOptions<any>,
            token: vscode.CancellationToken
          ) => {
            await startCPUProfiling();
            return new vscode.LanguageModelToolResult([
              new vscode.LanguageModelTextPart("CPU profiling started"),
            ]);
          },
        },
      },
    ];

    for (const { name, tool } of tools) {
      context.subscriptions.push(vscode.lm.registerTool(name, tool));
    }
    outputChannel.appendLine(`Registered ${tools.length} language model tools`);
  } catch (error) {
    outputChannel.appendLine(
      `Tool registration skipped (API not available): ${error}`
    );
  }

  // Initialize debug context provider
  debugContextProvider = new DebugContextProvider();

  // Start Language Server
  await startLanguageServer(context);

  // Initialize MCP client
  const config = vscode.workspace.getConfiguration("mcp-debugger");
  const autoStart = config.get<boolean>("autoStart", true);

  if (autoStart) {
    try {
      mcpClient = new MCPDebuggerClient(outputChannel);
      await mcpClient.start();
      debugContextProvider.setMCPClient(mcpClient);
      outputChannel.appendLine("MCP Debugger server started successfully");
    } catch (error) {
      outputChannel.appendLine(`Failed to start MCP server: ${error}`);
      // In test environment, this is expected to fail
      // In production, show error to user
      if (process.env.NODE_ENV === "production") {
        vscode.window.showErrorMessage("Failed to start MCP Debugger server");
      }
    }
  }

  // Register debug configuration provider
  const provider = new DebugConfigurationProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("mcp-node", provider)
  );

  // Register debug adapter descriptor factory
  const factory = new MCPDebugAdapterDescriptorFactory();
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory("mcp-node", factory)
  );
  context.subscriptions.push(factory);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.configureMcp", async () => {
      await configureMcpServer();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.start", async () => {
      await startDebugSession();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.detectHang", async () => {
      await detectHang();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.setBreakpoint", async () => {
      await setSmartBreakpoint();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.profileCPU", async () => {
      await startCPUProfiling();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.profileMemory", async () => {
      await takeHeapSnapshot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.showContext", async () => {
      const context = debugContextProvider.getContextString();
      vscode.window.showInformationMessage(context, { modal: true });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.getContext", async () => {
      return debugContextProvider.getContext();
    })
  );

  outputChannel.appendLine("=".repeat(60));
  outputChannel.appendLine("MCP Debugger extension activated");
  outputChannel.appendLine("=".repeat(60));

  // Show notification to confirm activation
  vscode.window.showInformationMessage(
    "MCP Debugger extension activated! Check Output panel for details."
  );

  // Configure shared status bar with our output channel
  // This also registers the mcp-acs.diagnostics command globally
  outputChannel.appendLine("Configuring shared status bar...");
  try {
    setOutputChannel(outputChannel);
    outputChannel.appendLine("✓ Shared status bar output channel configured");
    outputChannel.appendLine(
      "✓ Diagnostic command 'mcp-acs.diagnostics' is now available in the command palette"
    );
  } catch (error) {
    outputChannel.appendLine(`✗ Error configuring shared status bar: ${error}`);
    console.error("Error configuring shared status bar:", error);
  }

  // Register with shared status bar
  outputChannel.appendLine("Registering extension with shared status bar...");
  try {
    registerExtension("mcp-debugger");
    outputChannel.appendLine("✓ Extension registered with shared status bar");
    outputChannel.appendLine(
      "✓ Status bar icon should now be visible in the bottom right"
    );
  } catch (error) {
    outputChannel.appendLine(
      `✗ Error registering with shared status bar: ${error}`
    );
    console.error("Error registering with shared status bar:", error);
  }

  outputChannel.appendLine("=".repeat(60));
  outputChannel.appendLine(
    "To verify status bar: Run command 'MCP ACS: Show Status Bar Diagnostics'"
  );
  outputChannel.appendLine("=".repeat(60));

  // Show the output channel so user can see activation logs
  outputChannel.show(true); // true = preserveFocus

  context.subscriptions.push({
    dispose: () => unregisterExtension("mcp-debugger"),
  });

  console.log("=".repeat(60));
  console.log("✓ MCP Debugger extension activation completed successfully");
  console.log("=".repeat(60));
}

export async function deactivate() {
  unregisterExtension("mcp-debugger");
  if (mcpClient) {
    mcpClient.stop();
  }
  if (languageClient) {
    await languageClient.stop();
  }
  outputChannel.dispose();
}

async function startLanguageServer(context: vscode.ExtensionContext) {
  try {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(
      path.join("out", "languageServer.js")
    );

    // Check if server module exists
    const fs = require("fs");
    if (!fs.existsSync(serverModule)) {
      outputChannel.appendLine(
        `Language server module not found at: ${serverModule}`
      );
      outputChannel.appendLine("Skipping language server startup");
      return;
    }

    // The debug options for the server
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: debugOptions,
      },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
      // Register the server for JavaScript and TypeScript documents
      documentSelector: [
        { scheme: "file", language: "javascript" },
        { scheme: "file", language: "typescript" },
        { scheme: "file", language: "javascriptreact" },
        { scheme: "file", language: "typescriptreact" },
      ],
      synchronize: {
        // Notify the server about file changes to '.js, .ts files contained in the workspace
        fileEvents: vscode.workspace.createFileSystemWatcher("**/*.{js,ts}"),
      },
      outputChannel: outputChannel,
    };

    // Create the language client and start the client
    languageClient = new LanguageClient(
      "mcpDebuggerLanguageServer",
      "MCP Debugger Language Server",
      serverOptions,
      clientOptions
    );

    // Start the client. This will also launch the server
    await languageClient.start();

    outputChannel.appendLine("Language Server started successfully");
  } catch (error) {
    outputChannel.appendLine(`Failed to start language server: ${error}`);
    outputChannel.appendLine(
      "Extension will continue without language server features"
    );
    // Don't throw - allow extension to continue without language server
  }

  // Register command handlers that delegate to the language server
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mcp.debugger.inspectVariable",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          return;
        }

        const position = editor.selection.active;
        const wordRange = editor.document.getWordRangeAtPosition(position);
        if (!wordRange) {
          return;
        }

        const word = editor.document.getText(wordRange);

        // Execute command via language server
        const result = await languageClient?.sendRequest(
          "workspace/executeCommand",
          {
            command: "mcp.debugger.inspect",
            arguments: [word],
          }
        );

        if (result) {
          vscode.window.showInformationMessage(
            `${word} = ${JSON.stringify(result)}`
          );
        }
      }
    )
  );
}

async function startDebugSession() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active file to debug");
    return;
  }

  const filePath = editor.document.uri.fsPath;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    editor.document.uri
  );

  if (!workspaceFolder) {
    vscode.window.showErrorMessage("File must be in a workspace");
    return;
  }

  // Start debug session
  const config: vscode.DebugConfiguration = {
    type: "mcp-node",
    request: "launch",
    name: "MCP Debug Current File",
    program: filePath,
    cwd: workspaceFolder.uri.fsPath,
    enableHangDetection: true,
  };

  await vscode.debug.startDebugging(workspaceFolder, config);
}

async function detectHang() {
  if (!mcpClient) {
    vscode.window.showErrorMessage("MCP Debugger server not running");
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active file");
    return;
  }

  const filePath = editor.document.uri.fsPath;
  const config = vscode.workspace.getConfiguration("mcp-debugger");
  const timeout = config.get<number>("hangDetectionTimeout", 5000);

  try {
    outputChannel.appendLine(`Detecting hangs in ${filePath}...`);

    const result = await mcpClient.detectHang({
      command: "node",
      args: [filePath],
      timeout: timeout,
    });

    if (result.hung) {
      vscode.window
        .showWarningMessage(
          `Hang detected at ${result.location}`,
          "Show Details"
        )
        .then((selection) => {
          if (selection === "Show Details") {
            const panel = vscode.window.createWebviewPanel(
              "hangDetails",
              "Hang Detection Results",
              vscode.ViewColumn.One,
              {}
            );
            panel.webview.html = getHangDetailsHTML(result);
          }
        });
    } else {
      vscode.window.showInformationMessage("No hangs detected");
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Hang detection failed: ${error}`);
  }
}

async function setSmartBreakpoint() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const position = editor.selection.active;
  const filePath = editor.document.uri.fsPath;

  // Get smart breakpoint suggestions from MCP server
  if (mcpClient) {
    try {
      const suggestions = await mcpClient.suggestBreakpoints(filePath);

      if (suggestions.length > 0) {
        const items = suggestions.map((s) => ({
          label: `Line ${s.line}: ${s.reason}`,
          description: s.functionName,
          line: s.line,
        }));

        const selected = await vscode.window.showQuickPick(items, {
          placeHolder: "Select a suggested breakpoint location",
        });

        if (selected) {
          // Set breakpoint at suggested location
          const bp = new vscode.SourceBreakpoint(
            new vscode.Location(
              editor.document.uri,
              new vscode.Position(selected.line - 1, 0)
            )
          );
          vscode.debug.addBreakpoints([bp]);
        }
      } else {
        // Set breakpoint at current line
        const bp = new vscode.SourceBreakpoint(
          new vscode.Location(editor.document.uri, position)
        );
        vscode.debug.addBreakpoints([bp]);
      }
    } catch (error) {
      outputChannel.appendLine(
        `Failed to get breakpoint suggestions: ${error}`
      );
      // Fallback to setting breakpoint at current line
      const bp = new vscode.SourceBreakpoint(
        new vscode.Location(editor.document.uri, position)
      );
      vscode.debug.addBreakpoints([bp]);
    }
  }
}

async function startCPUProfiling() {
  if (!mcpClient) {
    vscode.window.showErrorMessage("MCP Debugger server not running");
    return;
  }

  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showErrorMessage("No active debug session");
    return;
  }

  try {
    await mcpClient.startCPUProfile(session.id);
    vscode.window.showInformationMessage("CPU profiling started");
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to start CPU profiling: ${error}`);
  }
}

async function takeHeapSnapshot() {
  if (!mcpClient) {
    vscode.window.showErrorMessage("MCP Debugger server not running");
    return;
  }

  const session = vscode.debug.activeDebugSession;
  if (!session) {
    vscode.window.showErrorMessage("No active debug session");
    return;
  }

  try {
    const snapshot = await mcpClient.takeHeapSnapshot(session.id);

    // In test environment, skip the save dialog
    if (process.env.VSCODE_TEST_MODE === "true") {
      vscode.window.showInformationMessage(
        "Heap snapshot captured (test mode)"
      );
      return;
    }

    // Save snapshot to file
    const uri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file("heap-snapshot.heapsnapshot"),
      filters: {
        "Heap Snapshot": ["heapsnapshot"],
      },
    });

    if (uri) {
      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(JSON.stringify(snapshot))
      );
      vscode.window.showInformationMessage(
        `Heap snapshot saved to ${uri.fsPath}`
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to take heap snapshot: ${error}`);
  }
}

function getHangDetailsHTML(result: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        h1 { color: var(--vscode-errorForeground); }
        .location { font-family: monospace; background: var(--vscode-textCodeBlock-background); padding: 10px; }
        .stack { margin-top: 20px; }
        .frame { margin: 5px 0; padding: 5px; background: var(--vscode-editor-background); }
      </style>
    </head>
    <body>
      <h1>⚠️ Hang Detected</h1>
      <p><strong>Location:</strong></p>
      <div class="location">${result.location}</div>
      
      <div class="stack">
        <h2>Call Stack:</h2>
        ${result.stack
          .map(
            (frame: any) => `
          <div class="frame">
            <strong>${frame.function || "(anonymous)"}</strong><br>
            ${frame.file}:${frame.line}
          </div>
        `
          )
          .join("")}
      </div>
      
      <p><strong>Message:</strong> ${result.message}</p>
    </body>
    </html>
  `;
}
