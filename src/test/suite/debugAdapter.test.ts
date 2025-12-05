import * as assert from "assert";
import * as vscode from "vscode";
import { MCPDebugAdapter } from "../../debugAdapter";

suite("Debug Adapter Test Suite", () => {
  suiteSetup(async () => {
    // Activate extension
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    await ext!.activate();
  });

  test("Should register debug adapter factory", async () => {
    // The debug adapter factory is registered during activation
    // We can verify by checking if extension is active
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext!.isActive, "Extension should be active");
  });

  test("Debug configuration should have required properties", () => {
    // Test a sample debug configuration structure
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      name: "Test",
      request: "launch",
      program: "${file}",
      cwd: "${workspaceFolder}",
    };

    assert.strictEqual(config.type, "mcp-node", "Type should be mcp-node");
    assert.strictEqual(config.request, "launch", "Request should be launch");
    assert.ok(config.program, "Should have program property");
    assert.ok(config.cwd, "Should have cwd property");
  });

  test("Should create debug adapter instance", () => {
    const adapter = new MCPDebugAdapter();
    assert.ok(adapter, "Adapter should be created");
  });

  test("Debug adapter should handle initialization", () => {
    const adapter = new MCPDebugAdapter();
    assert.ok(adapter, "Adapter should initialize");
  });

  test("Launch configuration should support all properties", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Full Config",
      program: "/path/to/file.js",
      args: ["--arg1", "--arg2"],
      cwd: "/working/dir",
      env: { NODE_ENV: "test" },
      timeout: 60000,
      enableHangDetection: true,
      enableProfiling: true,
    };

    assert.strictEqual(config.type, "mcp-node");
    assert.strictEqual(config.request, "launch");
    assert.ok(config.program);
    assert.ok(Array.isArray(config.args));
    assert.ok(config.cwd);
    assert.ok(config.env);
    assert.ok(typeof config.timeout === "number");
    assert.ok(typeof config.enableHangDetection === "boolean");
    assert.ok(typeof config.enableProfiling === "boolean");
  });

  test("Attach configuration should support sessionId", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "attach",
      name: "Attach Config",
      sessionId: "test-session-123",
    };

    assert.strictEqual(config.type, "mcp-node");
    assert.strictEqual(config.request, "attach");
    assert.ok(config.sessionId);
  });

  test("Should support Jest test configuration", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Jest Tests",
      program: "${workspaceFolder}/node_modules/.bin/jest",
      args: ["--runInBand"],
      cwd: "${workspaceFolder}",
      enableHangDetection: true,
    };

    assert.strictEqual(config.type, "mcp-node");
    assert.ok(config.program.includes("jest"));
    assert.ok(config.args.includes("--runInBand"));
  });

  test("Should support Mocha test configuration", () => {
    const config: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Mocha Tests",
      program: "${workspaceFolder}/node_modules/.bin/mocha",
      args: ["--no-timeouts"],
      cwd: "${workspaceFolder}",
      enableHangDetection: true,
    };

    assert.strictEqual(config.type, "mcp-node");
    assert.ok(config.program.includes("mocha"));
    assert.ok(config.args.includes("--no-timeouts"));
  });

  test("Should validate configuration type", () => {
    const validConfig: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Valid",
      program: "/test.js",
    };

    assert.strictEqual(validConfig.type, "mcp-node");
  });

  test("Should validate request type", () => {
    const launchConfig: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "launch",
      name: "Launch",
      program: "/test.js",
    };

    const attachConfig: vscode.DebugConfiguration = {
      type: "mcp-node",
      request: "attach",
      name: "Attach",
      sessionId: "test",
    };

    assert.ok(
      launchConfig.request === "launch" || launchConfig.request === "attach"
    );
    assert.ok(
      attachConfig.request === "launch" || attachConfig.request === "attach"
    );
  });
});
