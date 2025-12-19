import * as vscode from "vscode";
import * as path from "path";
import { BaseMCPClient } from "@ai-capabilities-suite/mcp-client-base";

export class MCPDebuggerClient extends BaseMCPClient {
  private sessionId: string | undefined;
  private context: vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    outputChannel: vscode.LogOutputChannel
  ) {
    super("Debugger", outputChannel);
    this.context = context;
  }

  // ========== Abstract Method Implementations ==========

  protected getServerCommand(): { command: string; args: string[] } {
    const config = vscode.workspace.getConfiguration("mcp-debugger");
    const serverPath = config.get<string>("serverPath");

    // Determine server path
    let command: string;
    let args: string[] = [];

    if (process.env.VSCODE_TEST_MODE === "true") {
      let extensionPath = this.context.extensionUri
        ? this.context.extensionUri.fsPath
        : this.context.extensionPath;

      if (!extensionPath) {
        // Fallback to getting extension from registry
        const extension = vscode.extensions.getExtension(
          "DigitalDefiance.ts-mcp-debugger"
        );
        if (extension) {
          extensionPath = extension.extensionPath;
        }
      }

      if (!extensionPath) {
        throw new Error("Extension path could not be determined");
      }

      // Try to find local server in monorepo
      const localServerPath = path.resolve(
        extensionPath,
        "../mcp-debugger-server/dist/src/cli.js"
      );
      command = "node";
      args = [localServerPath];
      this.log("info", `[Test Mode] Using local server: ${localServerPath}`);
    } else if (serverPath && serverPath.length > 0) {
      command = serverPath;
      args = [];
    } else {
      // Use bundled server or npx
      command = process.platform === "win32" ? "npx.cmd" : "npx";
      args = ["@ai-capabilities-suite/mcp-debugger-server"];
    }

    return { command, args };
  }

  protected getServerEnv(): Record<string, string> {
    return { ...process.env } as Record<string, string>;
  }

  protected async onServerReady(): Promise<void> {
    // Debugger-specific initialization
    // No additional initialization needed for debugger
  }

  // ========== Debugger-Specific Methods ==========

  async detectHang(options: {
    command: string;
    args: string[];
    timeout: number;
  }): Promise<unknown> {
    // Call MCP tool: debugger_detect_hang
    return this.callTool("debugger_detect_hang", {
      command: options.command,
      args: options.args,
      timeout: options.timeout,
      sampleInterval: 100,
    });
  }

  async suggestBreakpoints(filePath: string): Promise<unknown[]> {
    // Call MCP tool: debugger_suggest_breakpoints (if available)
    try {
      const result = await this.callTool("debugger_suggest_breakpoints", {
        file: filePath,
      });
      return Array.isArray(result) ? result : [];
    } catch (error) {
      // Tool might not be available, return empty array
      return [];
    }
  }

  async startCPUProfile(sessionId: string): Promise<void> {
    await this.callTool("debugger_start_cpu_profile", { sessionId });
  }

  async stopCPUProfile(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_stop_cpu_profile", { sessionId });
  }

  async takeHeapSnapshot(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_take_heap_snapshot", { sessionId });
  }

  async startDebugSession(options: {
    command: string;
    args: string[];
    cwd: string;
    timeout?: number;
  }): Promise<{ sessionId: string }> {
    const result = (await this.callTool("debugger_start", {
      command: options.command,
      args: options.args,
      cwd: options.cwd,
      timeout: options.timeout || 30000,
    })) as { sessionId: string };

    this.sessionId = result.sessionId;
    return result;
  }

  async setBreakpoint(
    sessionId: string,
    file: string,
    line: number,
    condition?: string
  ): Promise<unknown> {
    return await this.callTool("debugger_set_breakpoint", {
      sessionId,
      file,
      line,
      condition,
    });
  }

  async continue(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_continue", { sessionId });
  }

  async stepOver(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_step_over", { sessionId });
  }

  async stepInto(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_step_into", { sessionId });
  }

  async stepOut(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_step_out", { sessionId });
  }

  async pause(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_pause", { sessionId });
  }

  async getStack(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_get_stack", { sessionId });
  }

  async inspect(sessionId: string, expression: string): Promise<unknown> {
    return await this.callTool("debugger_inspect", { sessionId, expression });
  }

  async stopSession(sessionId: string): Promise<unknown> {
    return await this.callTool("debugger_stop_session", { sessionId });
  }
}
