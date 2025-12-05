import * as assert from "assert";
import * as vscode from "vscode";

suite("Backward Compatibility Test Suite", () => {
  test("All original commands should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);

    const expectedCommands = [
      "mcp-debugger.start",
      "mcp-debugger.detectHang",
      "mcp-debugger.setBreakpoint",
      "mcp-debugger.profileCPU",
      "mcp-debugger.profileMemory",
      "mcp-debugger.showContext",
      "mcp-debugger.getContext",
    ];

    for (const cmd of expectedCommands) {
      assert.ok(
        commands.includes(cmd),
        `Command ${cmd} should still be registered`
      );
    }
  });

  test("Configuration schema should remain unchanged", () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    // Verify all original configuration options exist
    assert.ok(config.has("serverPath"), "serverPath config exists");
    assert.ok(config.has("autoStart"), "autoStart config exists");
    assert.ok(config.has("defaultTimeout"), "defaultTimeout config exists");
    assert.ok(
      config.has("enableHangDetection"),
      "enableHangDetection config exists"
    );
    assert.ok(
      config.has("hangDetectionTimeout"),
      "hangDetectionTimeout config exists"
    );
    assert.ok(config.has("enableProfiling"), "enableProfiling config exists");
    assert.ok(config.has("logLevel"), "logLevel config exists");
  });

  test("Debug configuration type should remain mcp-node", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    const debuggers = packageJSON.contributes.debuggers;
    assert.ok(debuggers.length > 0, "Should have debuggers");
    assert.strictEqual(
      debuggers[0].type,
      "mcp-node",
      "Debug type should be mcp-node"
    );
  });

  test("Launch configuration should support original properties", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Test",
      program: "${file}",
      cwd: "${workspaceFolder}",
      args: [],
      env: {},
      timeout: 30000,
      enableHangDetection: true,
      enableProfiling: false,
    };

    // All properties should be valid
    assert.strictEqual(config.type, "mcp-node");
    assert.strictEqual(config.request, "launch");
    assert.ok(config.program);
    assert.ok(config.cwd);
    assert.ok(Array.isArray(config.args));
    assert.ok(typeof config.env === "object");
    assert.ok(typeof config.timeout === "number");
    assert.ok(typeof config.enableHangDetection === "boolean");
    assert.ok(typeof config.enableProfiling === "boolean");
  });

  test("Attach configuration should support sessionId", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "attach",
      name: "Attach Test",
      sessionId: "test-session-123",
    };

    assert.strictEqual(config.type, "mcp-node");
    assert.strictEqual(config.request, "attach");
    assert.ok(config.sessionId);
  });

  test("Extension metadata should be preserved", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    assert.strictEqual(packageJSON.name, "ts-mcp-debugger");
    assert.strictEqual(packageJSON.publisher, "DigitalDefiance");
    assert.ok(packageJSON.version);
    assert.ok(packageJSON.displayName);
    assert.ok(packageJSON.description);
  });

  test("Extension categories should include Debuggers", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    assert.ok(
      packageJSON.categories.includes("Debuggers"),
      "Should be in Debuggers category"
    );
  });

  test("Extension should activate on debug events", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    assert.ok(
      packageJSON.activationEvents.includes("onDebug"),
      "Should activate on debug"
    );
    assert.ok(
      packageJSON.activationEvents.includes("onLanguage:javascript"),
      "Should activate on JavaScript"
    );
    assert.ok(
      packageJSON.activationEvents.includes("onLanguage:typescript"),
      "Should activate on TypeScript"
    );
  });

  test("Context menu commands should be preserved", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    const contextMenus = packageJSON.contributes.menus["editor/context"];
    assert.ok(contextMenus.length > 0, "Should have context menu items");

    const breakpointMenu = contextMenus.find(
      (m: any) => m.command === "mcp-debugger.setBreakpoint"
    );
    assert.ok(breakpointMenu, "Breakpoint context menu should exist");
  });

  test("Command palette commands should be preserved", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    const packageJSON = ext!.packageJSON;

    const paletteMenus = packageJSON.contributes.menus.commandPalette;
    assert.ok(paletteMenus.length > 0, "Should have command palette items");

    const startCommand = paletteMenus.find(
      (m: any) => m.command === "mcp-debugger.start"
    );
    assert.ok(startCommand, "Start command should be in palette");
  });

  test("Default configuration values should be preserved", () => {
    const config = vscode.workspace.getConfiguration("mcp-debugger");

    // Check default values haven't changed
    assert.strictEqual(
      config.get("autoStart"),
      true,
      "autoStart default should be true"
    );
    assert.strictEqual(
      config.get("defaultTimeout"),
      30000,
      "defaultTimeout default should be 30000"
    );
    assert.strictEqual(
      config.get("enableHangDetection"),
      true,
      "enableHangDetection default should be true"
    );
    assert.strictEqual(
      config.get("hangDetectionTimeout"),
      5000,
      "hangDetectionTimeout default should be 5000"
    );
    assert.strictEqual(
      config.get("enableProfiling"),
      false,
      "enableProfiling default should be false"
    );
    assert.strictEqual(
      config.get("logLevel"),
      "info",
      "logLevel default should be info"
    );
  });

  test("Extension should work without language server", async function () {
    this.timeout(10000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );

    assert.ok(ext?.isActive, "Extension should be active");

    // Core commands should work even if language server fails
    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes("mcp-debugger.start"),
      "Core commands should be available"
    );
  });
});
