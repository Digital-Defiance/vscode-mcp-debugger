import * as vscode from "vscode";
import { MCPDebugAdapter } from "./debugAdapter";

/**
 * Factory for creating debug adapter instances.
 * This allows VS Code to create custom debug adapters for the MCP debugger.
 */
export class MCPDebugAdapterDescriptorFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * Create a debug adapter descriptor for the given debug session.
   * This method is called by VS Code when a debug session is about to start.
   */
  createDebugAdapterDescriptor(
    session: vscode.DebugSession,
    executable: vscode.DebugAdapterExecutable | undefined
  ): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
    // Create an inline debug adapter (runs in the same process as the extension)
    return new vscode.DebugAdapterInlineImplementation(
      new MCPDebugAdapter(this.context)
    );
  }

  /**
   * Dispose of any resources used by the factory.
   */
  dispose(): void {
    // Cleanup if needed
  }
}
