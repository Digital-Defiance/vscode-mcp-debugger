import {
  DebugSession,
  InitializedEvent,
  TerminatedEvent,
  StoppedEvent,
  BreakpointEvent,
  OutputEvent,
  Thread,
  StackFrame,
  Scope,
  Source,
  Handles,
  Breakpoint,
} from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { MCPDebuggerClient } from "./mcpClient";
import * as vscode from "vscode";

interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
  args?: string[];
  cwd?: string;
  env?: { [key: string]: string };
  timeout?: number;
  enableHangDetection?: boolean;
  enableProfiling?: boolean;
}

export class MCPDebugAdapter extends DebugSession {
  private mcpClient: MCPDebuggerClient;
  private sessionId: string | undefined;
  private variableHandles = new Handles<string>();

  constructor() {
    super();
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);

    const outputChannel =
      vscode.window.createOutputChannel("MCP Debug Adapter");
    this.mcpClient = new MCPDebuggerClient(outputChannel);
  }

  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsEvaluateForHovers = true;
    response.body.supportsStepBack = false;
    response.body.supportsSetVariable = false;
    response.body.supportsRestartFrame = false;
    response.body.supportsConditionalBreakpoints = true;
    response.body.supportsHitConditionalBreakpoints = true;
    response.body.supportsLogPoints = true;

    this.sendResponse(response);
    this.sendEvent(new InitializedEvent());
  }

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: LaunchRequestArguments
  ): Promise<void> {
    try {
      // Start MCP client
      await this.mcpClient.start();

      // Start debug session
      const result = await this.mcpClient.startDebugSession({
        command: "node",
        args: [args.program, ...(args.args || [])],
        cwd: args.cwd || process.cwd(),
        timeout: args.timeout,
      });

      this.sessionId = result.sessionId;

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1001,
        format: `Failed to launch: ${error}`,
        showUser: true,
      });
    }
  }

  protected async setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    const path = args.source.path!;
    const breakpoints: Breakpoint[] = [];

    if (args.breakpoints) {
      for (const bp of args.breakpoints) {
        try {
          const result = await this.mcpClient.setBreakpoint(
            this.sessionId,
            path,
            bp.line,
            bp.condition
          );

          breakpoints.push(
            new Breakpoint(result.verified, bp.line, 0, new Source(path, path))
          );
        } catch (error) {
          breakpoints.push(new Breakpoint(false, bp.line));
        }
      }
    }

    response.body = {
      breakpoints: breakpoints,
    };

    this.sendResponse(response);
  }

  protected async continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      await this.mcpClient.continue(this.sessionId);
      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1003,
        format: `Continue failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected async nextRequest(
    response: DebugProtocol.NextResponse,
    args: DebugProtocol.NextArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      await this.mcpClient.stepOver(this.sessionId);
      this.sendResponse(response);
      this.sendEvent(new StoppedEvent("step", 1));
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1004,
        format: `Step over failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected async stepInRequest(
    response: DebugProtocol.StepInResponse,
    args: DebugProtocol.StepInArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      await this.mcpClient.stepInto(this.sessionId);
      this.sendResponse(response);
      this.sendEvent(new StoppedEvent("step", 1));
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1005,
        format: `Step into failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected async stepOutRequest(
    response: DebugProtocol.StepOutResponse,
    args: DebugProtocol.StepOutArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      await this.mcpClient.stepOut(this.sessionId);
      this.sendResponse(response);
      this.sendEvent(new StoppedEvent("step", 1));
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1006,
        format: `Step out failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected async pauseRequest(
    response: DebugProtocol.PauseResponse,
    args: DebugProtocol.PauseArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      await this.mcpClient.pause(this.sessionId);
      this.sendResponse(response);
      this.sendEvent(new StoppedEvent("pause", 1));
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1007,
        format: `Pause failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = {
      threads: [new Thread(1, "Main Thread")],
    };
    this.sendResponse(response);
  }

  protected async stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    args: DebugProtocol.StackTraceArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      const stack = await this.mcpClient.getStack(this.sessionId);

      const frames: StackFrame[] = stack.frames.map(
        (frame: any, index: number) => {
          return new StackFrame(
            index,
            frame.functionName || "(anonymous)",
            new Source(frame.file, frame.file),
            frame.line,
            frame.column || 0
          );
        }
      );

      response.body = {
        stackFrames: frames,
        totalFrames: frames.length,
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1008,
        format: `Stack trace failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {
    response.body = {
      scopes: [
        new Scope("Local", this.variableHandles.create("local"), false),
        new Scope("Global", this.variableHandles.create("global"), true),
      ],
    };
    this.sendResponse(response);
  }

  protected async variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    const scope = this.variableHandles.get(args.variablesReference);

    try {
      // Get variables from MCP server
      const result = await this.mcpClient.inspect(this.sessionId, scope);

      const variables = result.variables.map((v: any) => ({
        name: v.name,
        value: v.value,
        type: v.type,
        variablesReference: 0,
      }));

      response.body = {
        variables: variables,
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1009,
        format: `Variables request failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected async evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ): Promise<void> {
    if (!this.sessionId) {
      this.sendErrorResponse(response, {
        id: 1002,
        format: "No active debug session",
        showUser: true,
      });
      return;
    }

    try {
      const result = await this.mcpClient.inspect(
        this.sessionId,
        args.expression
      );

      response.body = {
        result: result.value,
        type: result.type,
        variablesReference: 0,
      };

      this.sendResponse(response);
    } catch (error) {
      this.sendErrorResponse(response, {
        id: 1010,
        format: `Evaluation failed: ${error}`,
        showUser: true,
      });
    }
  }

  protected disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments
  ): void {
    if (this.sessionId) {
      this.mcpClient.stopSession(this.sessionId).catch(() => {});
    }
    this.mcpClient.stop();
    this.sendResponse(response);
  }
}
