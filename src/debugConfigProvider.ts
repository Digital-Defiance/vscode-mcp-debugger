import * as vscode from "vscode";

export class DebugConfigurationProvider
  implements vscode.DebugConfigurationProvider
{
  /**
   * Massage a debug configuration just before a debug session is being launched,
   * e.g. add all missing attributes to the debug configuration.
   */
  resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    // If launch.json is missing or empty
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (
        editor &&
        (editor.document.languageId === "javascript" ||
          editor.document.languageId === "typescript")
      ) {
        config.type = "mcp-node";
        config.name = "MCP Debug";
        config.request = "launch";
        config.program = "${file}";
        config.cwd = "${workspaceFolder}";
      }
    }

    if (!config.program) {
      return vscode.window
        .showInformationMessage("Cannot find a program to debug")
        .then((_) => {
          return undefined; // abort launch
        });
    }

    // Set defaults
    config.cwd = config.cwd || "${workspaceFolder}";
    config.timeout = config.timeout || 30000;
    config.enableHangDetection =
      config.enableHangDetection !== undefined
        ? config.enableHangDetection
        : true;
    config.enableProfiling = config.enableProfiling || false;

    return config;
  }

  /**
   * Provide initial debug configurations for launch.json
   */
  provideDebugConfigurations(
    folder: vscode.WorkspaceFolder | undefined,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration[]> {
    return [
      {
        type: "mcp-node",
        request: "launch",
        name: "MCP Debug Current File",
        program: "${file}",
        cwd: "${workspaceFolder}",
        enableHangDetection: true,
      },
      {
        type: "mcp-node",
        request: "launch",
        name: "MCP Debug with Profiling",
        program: "${workspaceFolder}/index.js",
        cwd: "${workspaceFolder}",
        enableProfiling: true,
        enableHangDetection: true,
      },
      {
        type: "mcp-node",
        request: "launch",
        name: "MCP Debug Jest Tests",
        program: "${workspaceFolder}/node_modules/.bin/jest",
        args: ["--runInBand"],
        cwd: "${workspaceFolder}",
        enableHangDetection: true,
      },
      {
        type: "mcp-node",
        request: "launch",
        name: "MCP Debug Mocha Tests",
        program: "${workspaceFolder}/node_modules/.bin/mocha",
        args: ["--no-timeouts"],
        cwd: "${workspaceFolder}",
        enableHangDetection: true,
      },
    ];
  }
}
