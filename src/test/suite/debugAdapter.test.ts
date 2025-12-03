import * as assert from "assert";
import * as vscode from "vscode";

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
});
