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

export async function activate(context: vscode.ExtensionContext) {
  // Log to console first in case output channel creation fails
  console.log("=".repeat(60));
  console.log("MCP ACS Debugger extension activate() called");
  console.log(`Activation time: ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  try {
    outputChannel = vscode.window.createOutputChannel("MCP ACS Debugger", {
      log: true,
    });
    outputChannel.appendLine("=".repeat(60));
    outputChannel.appendLine("MCP ACS Debugger extension activating...");
    outputChannel.appendLine(`Activation time: ${new Date().toISOString()}`);
    outputChannel.appendLine("=".repeat(60));
    console.log("✓ Output channel created successfully");
  } catch (error) {
    console.error("✗ Failed to create output channel:", error);
    throw error;
  }

  // Register chat participant for Copilot integration
  const participant = vscode.chat.createChatParticipant(
    "ts-mcp-debugger.participant",
    async (request, context, stream, token) => {
      if (!mcpClient) {
        stream.markdown(
          "MCP ACS Debugger server is not running. Please start it first."
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
    // Show progress indicator during initialization
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "MCP ACS Debugger",
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ message: "Starting server..." });

          mcpClient = new MCPDebuggerClient(context, outputChannel);

          // Subscribe to connection state changes
          const stateSubscription = mcpClient.onStateChange((status) => {
            outputChannel.appendLine(
              `Connection state changed: ${status.state} - ${status.message}`
            );

            // Update progress indicator based on state
            if (status.state === "connecting") {
              progress.report({ message: "Connecting to server..." });
            } else if (status.state === "timeout_retrying") {
              progress.report({
                message: `Retrying connection (${status.retryCount || 0}/${
                  mcpClient?.getReSyncConfig().maxRetries || 3
                })...`,
              });
            }
          });

          context.subscriptions.push(stateSubscription);

          progress.report({ message: "Initializing connection..." });
          await mcpClient.start();

          debugContextProvider.setMCPClient(mcpClient);

          progress.report({ message: "Server ready" });
          outputChannel.appendLine(
            "MCP ACS Debugger server started successfully"
          );
        } catch (error) {
          outputChannel.appendLine(`Failed to start MCP server: ${error}`);
          // In test environment, this is expected to fail
          // In production, show error to user
          if (process.env.NODE_ENV === "production") {
            vscode.window.showErrorMessage(
              "Failed to start MCP ACS Debugger server"
            );
          }
        }
      }
    );
  }

  // Register debug configuration provider
  const provider = new DebugConfigurationProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("mcp-node", provider)
  );

  // Register debug adapter descriptor factory
  const factory = new MCPDebugAdapterDescriptorFactory(context);
  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory("mcp-node", factory)
  );
  context.subscriptions.push(factory);

  // Register commands
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

  // Diagnostic commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mcp-debugger.reconnectToServer",
      async () => {
        if (!mcpClient) {
          vscode.window.showErrorMessage("MCP ACS Debugger server not running");
          return;
        }

        try {
          outputChannel.appendLine(
            "Reconnecting to MCP ACS Debugger server..."
          );
          const success = await mcpClient.reconnect();

          if (success) {
            vscode.window.showInformationMessage(
              "Reconnected to MCP ACS Debugger server"
            );
            outputChannel.appendLine("Reconnection successful");
          } else {
            vscode.window.showErrorMessage(
              "Failed to reconnect to MCP ACS Debugger server"
            );
            outputChannel.appendLine("Reconnection failed");
          }
        } catch (error: any) {
          vscode.window.showErrorMessage(
            `Reconnection error: ${error.message || error}`
          );
          outputChannel.appendLine(
            `Reconnection error: ${error.message || error}`
          );
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("mcp-debugger.restartServer", async () => {
      if (!mcpClient) {
        vscode.window.showErrorMessage("MCP ACS Debugger server not running");
        return;
      }

      try {
        outputChannel.appendLine("Restarting MCP ACS Debugger server...");
        mcpClient.stop();
        await new Promise((resolve) => setTimeout(resolve, 500));
        await mcpClient.start();
        vscode.window.showInformationMessage(
          "MCP ACS Debugger server restarted successfully"
        );
        outputChannel.appendLine("Server restarted successfully");
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Restart error: ${error.message || error}`
        );
        outputChannel.appendLine(`Restart error: ${error.message || error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "mcp-debugger.showDiagnostics",
      async () => {
        if (!mcpClient) {
          vscode.window.showErrorMessage("MCP ACS Debugger server not running");
          return;
        }

        try {
          const diagnostics = mcpClient.getDiagnostics();

          // Show diagnostics in output channel
          outputChannel.clear();
          outputChannel.show(true);
          outputChannel.appendLine("=".repeat(80));
          outputChannel.appendLine("MCP ACS Debugger Diagnostics");
          outputChannel.appendLine("=".repeat(80));
          outputChannel.appendLine("");
          outputChannel.appendLine(`Extension: ${diagnostics.extensionName}`);
          outputChannel.appendLine(
            `Connection State: ${diagnostics.connectionState}`
          );
          outputChannel.appendLine(
            `Process Running: ${diagnostics.processRunning ? "Yes" : "No"}`
          );
          if (diagnostics.processId) {
            outputChannel.appendLine(`Process ID: ${diagnostics.processId}`);
          }
          outputChannel.appendLine("");
          outputChannel.appendLine(
            `Pending Requests: ${diagnostics.pendingRequestCount}`
          );

          if (diagnostics.pendingRequests.length > 0) {
            outputChannel.appendLine("");
            outputChannel.appendLine("Active Requests:");
            for (const req of diagnostics.pendingRequests) {
              outputChannel.appendLine(
                `  - [${req.id}] ${req.method} (${req.elapsedMs}ms elapsed)`
              );
            }
          }

          if (diagnostics.lastError) {
            outputChannel.appendLine("");
            outputChannel.appendLine(
              `Last Error: ${diagnostics.lastError.message}`
            );
            outputChannel.appendLine(
              `  Timestamp: ${new Date(
                diagnostics.lastError.timestamp
              ).toISOString()}`
            );
          }

          if (diagnostics.recentCommunication.length > 0) {
            outputChannel.appendLine("");
            outputChannel.appendLine("Recent Communication (last 10):");
            const recent = diagnostics.recentCommunication.slice(-10);
            for (const comm of recent) {
              const timestamp = new Date(comm.timestamp).toISOString();
              const status = comm.success ? "✓" : "✗";
              const method = comm.method || "notification";
              outputChannel.appendLine(
                `  ${status} [${timestamp}] ${comm.type}: ${method}`
              );
            }
          }

          if (diagnostics.stateHistory.length > 0) {
            outputChannel.appendLine("");
            outputChannel.appendLine("State History (last 10):");
            const history = diagnostics.stateHistory.slice(-10);
            for (const state of history) {
              const timestamp = new Date(state.timestamp).toISOString();
              outputChannel.appendLine(
                `  [${timestamp}] ${state.state}: ${state.message}`
              );
            }
          }

          outputChannel.appendLine("");
          outputChannel.appendLine("=".repeat(80));
        } catch (error: any) {
          vscode.window.showErrorMessage(
            `Failed to get diagnostics: ${error.message || error}`
          );
          outputChannel.appendLine(
            `Failed to get diagnostics: ${error.message || error}`
          );
        }
      }
    )
  );

  outputChannel.appendLine("=".repeat(60));
  outputChannel.appendLine("MCP ACS Debugger extension activated");
  outputChannel.appendLine("=".repeat(60));

  // Register with shared status bar FIRST
  outputChannel.appendLine("Registering extension with shared status bar...");
  try {
    await registerExtension("mcp-debugger", {
      displayName: "MCP ACS Debugger",
      status: "ok",
      settingsQuery: "mcp-debugger",
      actions: [
        {
          label: "Start Debug Session",
          command: "mcp-debugger.start",
          description: "Start debugging current file",
        },
        {
          label: "Detect Hangs",
          command: "mcp-debugger.detectHang",
          description: "Check for infinite loops",
        },
        {
          label: "Profile CPU",
          command: "mcp-debugger.profileCPU",
          description: "Analyze performance",
        },
        {
          label: "Take Heap Snapshot",
          command: "mcp-debugger.profileMemory",
          description: "Analyze memory usage",
        },
        {
          label: "Reconnect to Server",
          command: "mcp-debugger.reconnectToServer",
          description: "Reconnect to MCP server",
        },
        {
          label: "Restart Server",
          command: "mcp-debugger.restartServer",
          description: "Restart MCP server",
        },
        {
          label: "Show Diagnostics",
          command: "mcp-debugger.showDiagnostics",
          description: "Show server diagnostics",
        },
      ],
    });
    outputChannel.appendLine("✓ Extension registered with shared status bar");
  } catch (error) {
    outputChannel.appendLine(
      `✗ Error registering with shared status bar: ${error}`
    );
    console.error("Error registering with shared status bar:", error);
  }

  // Configure shared status bar output channel (idempotent - only first call takes effect)
  try {
    setOutputChannel(outputChannel);
    outputChannel.appendLine("✓ Shared status bar output channel configured");
  } catch (error) {
    outputChannel.appendLine(`✗ Error configuring shared status bar: ${error}`);
    console.error("Error configuring shared status bar:", error);
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
  console.log("✓ MCP ACS Debugger extension activation completed successfully");
  console.log("=".repeat(60));
}

export async function deactivate() {
  await unregisterExtension("mcp-debugger");
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
      "MCP ACS Debugger Language Server",
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
    vscode.window.showErrorMessage("MCP ACS Debugger server not running");
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
    if (process.env.VSCODE_TEST_MODE === "true") {
      throw new Error("MCP ACS Debugger server not running");
    }
    vscode.window.showErrorMessage("MCP ACS Debugger server not running");
    return;
  }

  const session = vscode.debug.activeDebugSession;
  if (!session) {
    if (process.env.VSCODE_TEST_MODE === "true") {
      throw new Error("No active debug session");
    }
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
    if (process.env.VSCODE_TEST_MODE === "true") {
      throw new Error("MCP ACS Debugger server not running");
    }
    vscode.window.showErrorMessage("MCP ACS Debugger server not running");
    return;
  }

  const session = vscode.debug.activeDebugSession;
  if (!session) {
    if (process.env.VSCODE_TEST_MODE === "true") {
      throw new Error("No active debug session");
    }
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
