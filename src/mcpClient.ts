import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import * as path from "path";

export class MCPDebuggerClient {
  private serverProcess: ChildProcess | undefined;
  private sessionId: string | undefined;

  constructor(private outputChannel: vscode.OutputChannel) {}

  async start(): Promise<void> {
    const config = vscode.workspace.getConfiguration("mcp-debugger");
    const serverPath = config.get<string>("serverPath");

    // Determine server path
    let command: string;
    let args: string[] = [];

    if (serverPath && serverPath.length > 0) {
      command = serverPath;
    } else {
      // Use bundled server or npx
      command = "npx";
      args = ["@ai-capabilities-suite/mcp-debugger-server"];
    }

    this.outputChannel.appendLine(
      `Starting MCP server: ${command} ${args.join(" ")}`
    );

    this.serverProcess = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.serverProcess.stdout?.on("data", (data) => {
      this.outputChannel.appendLine(`[MCP Server] ${data.toString()}`);
    });

    this.serverProcess.stderr?.on("data", (data) => {
      this.outputChannel.appendLine(`[MCP Server Error] ${data.toString()}`);
    });

    this.serverProcess.on("error", (error) => {
      this.outputChannel.appendLine(
        `[MCP Server] Process error: ${error.message}`
      );
    });

    this.serverProcess.on("exit", (code) => {
      this.outputChannel.appendLine(
        `[MCP Server] Process exited with code ${code}`
      );
    });

    // Wait for server to be ready
    await this.waitForReady();
  }

  stop(): void {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = undefined;
    }
  }

  private async waitForReady(): Promise<void> {
    // Simple wait - in production, should check for ready signal
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async detectHang(options: {
    command: string;
    args: string[];
    timeout: number;
  }): Promise<any> {
    // Call MCP tool: debugger_detect_hang
    return this.callTool("debugger_detect_hang", {
      command: options.command,
      args: options.args,
      timeout: options.timeout,
      sampleInterval: 100,
    });
  }

  async suggestBreakpoints(filePath: string): Promise<any[]> {
    // Call MCP tool: debugger_suggest_breakpoints (if available)
    try {
      return await this.callTool("debugger_suggest_breakpoints", {
        file: filePath,
      });
    } catch (error) {
      // Tool might not be available, return empty array
      return [];
    }
  }

  async startCPUProfile(sessionId: string): Promise<void> {
    await this.callTool("debugger_start_cpu_profile", { sessionId });
  }

  async stopCPUProfile(sessionId: string): Promise<any> {
    return await this.callTool("debugger_stop_cpu_profile", { sessionId });
  }

  async takeHeapSnapshot(sessionId: string): Promise<any> {
    return await this.callTool("debugger_take_heap_snapshot", { sessionId });
  }

  async startDebugSession(options: {
    command: string;
    args: string[];
    cwd: string;
    timeout?: number;
  }): Promise<{ sessionId: string }> {
    const result = await this.callTool("debugger_start", {
      command: options.command,
      args: options.args,
      cwd: options.cwd,
      timeout: options.timeout || 30000,
    });

    this.sessionId = result.sessionId;
    return result;
  }

  async setBreakpoint(
    sessionId: string,
    file: string,
    line: number,
    condition?: string
  ): Promise<any> {
    return await this.callTool("debugger_set_breakpoint", {
      sessionId,
      file,
      line,
      condition,
    });
  }

  async continue(sessionId: string): Promise<any> {
    return await this.callTool("debugger_continue", { sessionId });
  }

  async stepOver(sessionId: string): Promise<any> {
    return await this.callTool("debugger_step_over", { sessionId });
  }

  async stepInto(sessionId: string): Promise<any> {
    return await this.callTool("debugger_step_into", { sessionId });
  }

  async stepOut(sessionId: string): Promise<any> {
    return await this.callTool("debugger_step_out", { sessionId });
  }

  async pause(sessionId: string): Promise<any> {
    return await this.callTool("debugger_pause", { sessionId });
  }

  async getStack(sessionId: string): Promise<any> {
    return await this.callTool("debugger_get_stack", { sessionId });
  }

  async inspect(sessionId: string, expression: string): Promise<any> {
    return await this.callTool("debugger_inspect", { sessionId, expression });
  }

  async stopSession(sessionId: string): Promise<any> {
    return await this.callTool("debugger_stop_session", { sessionId });
  }

  private async callTool(toolName: string, args: any): Promise<any> {
    if (!this.serverProcess) {
      throw new Error("MCP server not running");
    }

    // Send JSON-RPC request to MCP server
    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Tool call timeout"));
      }, 30000);

      // Write request to stdin
      this.serverProcess!.stdin?.write(JSON.stringify(request) + "\n");

      // Listen for response on stdout
      const onData = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            clearTimeout(timeout);
            this.serverProcess!.stdout?.off("data", onData);

            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Ignore parse errors, might be partial data
        }
      };

      this.serverProcess!.stdout?.on("data", onData);
    });
  }
}
