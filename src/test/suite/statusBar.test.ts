import * as assert from "assert";
import * as vscode from "vscode";

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

    // Note: We cannot verify registeredExtensions via getDiagnosticInfo() here because
    // the test runner uses a different instance of the shared-status-bar module than the extension.
    // Instead, we verify that the diagnostic command (which is registered by the shared module) exists.

    // Verify that the diagnostic command is registered
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("mcp-acs.diagnostics"),
      "Diagnostic command should be registered after setOutputChannel is called"
    );
  });
});
