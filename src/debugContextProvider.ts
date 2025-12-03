import * as vscode from "vscode";
import { MCPDebuggerClient } from "./mcpClient";

/**
 * Debug context information exposed to AI agents like GitHub Copilot
 */
export interface DebugContext {
  active: boolean;
  sessionId?: string;
  paused?: boolean;
  location?: {
    file: string;
    line: number;
    column?: number;
  };
  callStack?: Array<{
    function: string;
    file: string;
    line: number;
  }>;
  localVariables?: Array<{
    name: string;
    value: string;
    type: string;
  }>;
  breakpoints?: Array<{
    id: string;
    file: string;
    line: number;
    enabled: boolean;
    condition?: string;
  }>;
  profiling?: {
    active: boolean;
    type?: "cpu" | "memory";
  };
}

/**
 * Provides debugging context to AI agents and Copilot.
 * This allows AI assistants to understand the current debugging state
 * and provide contextual assistance.
 */
export class DebugContextProvider {
  private mcpClient: MCPDebuggerClient | undefined;
  private currentContext: DebugContext = { active: false };

  constructor(mcpClient?: MCPDebuggerClient) {
    this.mcpClient = mcpClient;

    // Listen to debug session changes
    vscode.debug.onDidStartDebugSession((session) => {
      this.updateContext(session);
    });

    vscode.debug.onDidTerminateDebugSession(() => {
      this.currentContext = { active: false };
    });

    vscode.debug.onDidChangeActiveDebugSession((session) => {
      if (session) {
        this.updateContext(session);
      }
    });
  }

  /**
   * Get the current debug context for AI agents
   */
  getContext(): DebugContext {
    return this.currentContext;
  }

  /**
   * Get context as a formatted string for AI consumption
   */
  getContextString(): string {
    if (!this.currentContext.active) {
      return "No active debug session";
    }

    const parts: string[] = ["Debug Session Active"];

    if (this.currentContext.sessionId) {
      parts.push(`Session ID: ${this.currentContext.sessionId}`);
    }

    if (this.currentContext.paused && this.currentContext.location) {
      parts.push(
        `Paused at: ${this.currentContext.location.file}:${this.currentContext.location.line}`
      );
    }

    if (
      this.currentContext.callStack &&
      this.currentContext.callStack.length > 0
    ) {
      parts.push("\nCall Stack:");
      this.currentContext.callStack.forEach((frame, i) => {
        parts.push(`  ${i}. ${frame.function} (${frame.file}:${frame.line})`);
      });
    }

    if (
      this.currentContext.localVariables &&
      this.currentContext.localVariables.length > 0
    ) {
      parts.push("\nLocal Variables:");
      this.currentContext.localVariables.forEach((v) => {
        parts.push(`  ${v.name}: ${v.value} (${v.type})`);
      });
    }

    if (
      this.currentContext.breakpoints &&
      this.currentContext.breakpoints.length > 0
    ) {
      parts.push(
        `\nBreakpoints: ${this.currentContext.breakpoints.length} set`
      );
    }

    return parts.join("\n");
  }

  /**
   * Update context from active debug session
   */
  private async updateContext(session: vscode.DebugSession): Promise<void> {
    if (!this.mcpClient || session.type !== "mcp-node") {
      return;
    }

    try {
      this.currentContext = {
        active: true,
        sessionId: session.id,
        paused: false, // Will be updated when we get stack trace
      };

      // Try to get current state from MCP server
      // This is a best-effort attempt
      try {
        const stack = await this.mcpClient.getStack(session.id);
        if (stack && stack.frames && stack.frames.length > 0) {
          this.currentContext.paused = true;
          this.currentContext.location = {
            file: stack.frames[0].file,
            line: stack.frames[0].line,
            column: stack.frames[0].column,
          };
          this.currentContext.callStack = stack.frames.map((f: any) => ({
            function: f.functionName || "(anonymous)",
            file: f.file,
            line: f.line,
          }));
        }
      } catch (error) {
        // Session might not be paused yet, that's okay
      }
    } catch (error) {
      console.error("Failed to update debug context:", error);
    }
  }

  /**
   * Expose context to language server for Copilot
   */
  provideContextForLanguageServer(): any {
    return {
      debugContext: this.currentContext,
      contextString: this.getContextString(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Register context as a VS Code context key for conditional UI
   */
  registerContextKeys(context: vscode.ExtensionContext): void {
    // Set context keys that can be used in when clauses
    vscode.commands.executeCommand(
      "setContext",
      "mcp-debugger.active",
      this.currentContext.active
    );
    vscode.commands.executeCommand(
      "setContext",
      "mcp-debugger.paused",
      this.currentContext.paused
    );
  }

  /**
   * Provide debugging context as a code lens
   */
  provideCodeLens(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];

    if (!this.currentContext.active || !this.currentContext.location) {
      return lenses;
    }

    // If we're debugging this file, show context at the current location
    if (document.uri.fsPath === this.currentContext.location.file) {
      const line = this.currentContext.location.line - 1;
      const range = new vscode.Range(line, 0, line, 0);

      lenses.push(
        new vscode.CodeLens(range, {
          title: `🐛 Paused here - ${
            this.currentContext.callStack?.length || 0
          } frames`,
          command: "mcp-debugger.showContext",
        })
      );
    }

    return lenses;
  }

  /**
   * Set the MCP client (for late initialization)
   */
  setMCPClient(client: MCPDebuggerClient): void {
    this.mcpClient = client;
  }
}
