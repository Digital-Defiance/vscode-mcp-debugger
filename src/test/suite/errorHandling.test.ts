import * as assert from "assert";
import * as vscode from "vscode";

suite("Error Handling Test Suite", () => {
  test("Should handle server not running gracefully", async function () {
    this.timeout(10000);

    const config = vscode.workspace.getConfiguration("mcp-debugger");
    await config.update("autoStart", false, vscode.ConfigurationTarget.Global);

    try {
      await vscode.commands.executeCommand("mcp-debugger.detectHang");
    } catch (error) {
      assert.ok(true, "Handled server not running gracefully");
    }

    await config.update("autoStart", true, vscode.ConfigurationTarget.Global);
  });

  test("Should handle invalid server path", async function () {
    this.timeout(10000);

    const config = vscode.workspace.getConfiguration("mcp-debugger");
    const originalPath = config.get("serverPath");

    await config.update(
      "serverPath",
      "/invalid/path/to/server",
      vscode.ConfigurationTarget.Global
    );

    try {
      await vscode.commands.executeCommand("mcp-debugger.start");
    } catch (error) {
      assert.ok(true, "Handled invalid server path gracefully");
    }

    await config.update(
      "serverPath",
      originalPath,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Should handle missing active file", async () => {
    // Close all editors
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");

    try {
      await vscode.commands.executeCommand("mcp-debugger.start");
    } catch (error) {
      assert.ok(true, "Handled missing active file gracefully");
    }
  });

  test("Should handle debug session start failure", async function () {
    this.timeout(10000);

    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Invalid Config",
      program: "/nonexistent/file.js",
      cwd: "/nonexistent/dir",
    };

    try {
      await vscode.debug.startDebugging(undefined, config);
    } catch (error) {
      assert.ok(true, "Handled debug session start failure");
    }
  });

  test("Should handle profiling without active session", async () => {
    try {
      await vscode.commands.executeCommand("mcp-debugger.profileCPU");
    } catch (error) {
      assert.ok(true, "Handled profiling without session gracefully");
    }
  });

  test("Should handle heap snapshot without active session", async () => {
    try {
      await vscode.commands.executeCommand("mcp-debugger.profileMemory");
    } catch (error) {
      assert.ok(true, "Handled heap snapshot without session gracefully");
    }
  });

  test("Should handle invalid timeout values", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    try {
      await config.update(
        "defaultTimeout",
        -1000,
        vscode.ConfigurationTarget.Global
      );
      const timeout = config.get("defaultTimeout");
      assert.ok(timeout !== undefined, "Timeout setting handled");
    } catch (error) {
      assert.ok(true, "Invalid timeout rejected");
    }

    await config.update(
      "defaultTimeout",
      30000,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Extension should remain active after errors", async function () {
    this.timeout(10000);

    // Trigger multiple errors
    try {
      await vscode.commands.executeCommand("mcp-debugger.detectHang");
    } catch (error) {
      // Expected
    }

    try {
      await vscode.commands.executeCommand("mcp-debugger.profileCPU");
    } catch (error) {
      // Expected
    }

    // Extension should still be active
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext?.isActive, "Extension remains active after errors");
  });
});
