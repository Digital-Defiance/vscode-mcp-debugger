import * as assert from "assert";
import * as vscode from "vscode";

suite("Configuration Test Suite", () => {
  test("Should have default configuration values", async function() {
    this.timeout(5000);
    
    // Wait a bit for config to be available
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    assert.strictEqual(config.get("autoStart"), true);
    assert.strictEqual(config.get("defaultTimeout"), 30000);
    assert.strictEqual(config.get("enableHangDetection"), true);
    assert.strictEqual(config.get("hangDetectionTimeout"), 5000);
    assert.strictEqual(config.get("enableProfiling"), false);
    assert.strictEqual(config.get("logLevel"), "info");
  });

  test("Should update configuration values", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    await config.update("autoStart", false, vscode.ConfigurationTarget.Global);
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("autoStart"), false);

    // Reset
    await config.update("autoStart", true, vscode.ConfigurationTarget.Global);
    updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("autoStart"), true);
  });

  test("Should validate timeout values", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    await config.update(
      "defaultTimeout",
      60000,
      vscode.ConfigurationTarget.Global
    );
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("defaultTimeout"), 60000);

    // Reset
    await config.update(
      "defaultTimeout",
      30000,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Should validate log level enum", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    await config.update("logLevel", "debug", vscode.ConfigurationTarget.Global);
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("logLevel"), "debug");

    // Reset
    await config.update("logLevel", "info", vscode.ConfigurationTarget.Global);
  });

  test("Should handle server path configuration", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");
    const originalPath = config.get("serverPath");

    await config.update(
      "serverPath",
      "/custom/path",
      vscode.ConfigurationTarget.Global
    );
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("serverPath"), "/custom/path");

    // Reset
    await config.update(
      "serverPath",
      originalPath,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Should toggle hang detection", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    await config.update(
      "enableHangDetection",
      false,
      vscode.ConfigurationTarget.Global
    );
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("enableHangDetection"), false);

    // Reset
    await config.update(
      "enableHangDetection",
      true,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Should toggle profiling", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    await config.update(
      "enableProfiling",
      true,
      vscode.ConfigurationTarget.Global
    );
    let updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("enableProfiling"), true);

    // Reset
    await config.update(
      "enableProfiling",
      false,
      vscode.ConfigurationTarget.Global
    );
  });

  test("Configuration should persist across updates", async () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    // Update multiple settings
    await config.update(
      "defaultTimeout",
      45000,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "hangDetectionTimeout",
      10000,
      vscode.ConfigurationTarget.Global
    );

    // Verify both persisted
    const updated = vscode.workspace.getConfiguration("mcp-debugger");
    assert.strictEqual(updated.get("defaultTimeout"), 45000);
    assert.strictEqual(updated.get("hangDetectionTimeout"), 10000);

    // Reset
    await config.update(
      "defaultTimeout",
      30000,
      vscode.ConfigurationTarget.Global
    );
    await config.update(
      "hangDetectionTimeout",
      5000,
      vscode.ConfigurationTarget.Global
    );
  });
});
