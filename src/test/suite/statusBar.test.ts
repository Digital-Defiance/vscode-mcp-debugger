import * as assert from "assert";
import * as vscode from "vscode";
import { getDiagnosticInfo } from "@ai-capabilities-suite/vscode-shared-status-bar";

suite("Status Bar Tests", () => {
  test("Status bar item should be created after activation", async function () {
    this.timeout(5000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should exist");

    if (!ext.isActive) {
      await ext.activate();
    }

    // Check if status bar command is registered
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("mcp-debugger.showContext"),
      "Status bar command should be registered"
    );
  });

  test("Shared status bar should be configured with output channel", async function () {
    this.timeout(5000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should exist");

    if (!ext.isActive) {
      await ext.activate();
    }

    // Get diagnostic info from shared status bar
    const diagnosticInfo = getDiagnosticInfo();

    // Verify that the debugger extension is registered
    assert.ok(
      diagnosticInfo.registeredExtensions.includes("mcp-debugger"),
      "mcp-debugger should be registered with shared status bar"
    );

    // Verify that the status bar exists
    assert.ok(
      diagnosticInfo.statusBarExists,
      "Status bar item should exist after registration"
    );

    // Verify that the diagnostic command is registered
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("mcp-acs.diagnostics"),
      "Diagnostic command should be registered after setOutputChannel is called"
    );
  });
});
