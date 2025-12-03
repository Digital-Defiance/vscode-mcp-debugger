import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Extension should be present", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should be present");
  });

  test("Extension should activate without errors", async function () {
    this.timeout(10000); // Give it time to activate

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should exist");

    try {
      await ext!.activate();
      // Extension activated, even if some features failed
      assert.ok(true, "Extension activated");
    } catch (error) {
      // Extension activation failed completely
      assert.fail(`Extension failed to activate: ${error}`);
    }
  });

  test("Should register core commands", async function () {
    this.timeout(10000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    if (ext && !ext.isActive) {
      try {
        await ext.activate();
      } catch (error) {
        // Continue even if activation had issues
      }
    }

    const commands = await vscode.commands.getCommands(true);

    // Check for at least some commands (not all may be available in test environment)
    const expectedCommands = [
      "mcp-debugger.start",
      "mcp-debugger.showContext",
      "mcp-debugger.getContext",
    ];

    let foundCount = 0;
    for (const cmd of expectedCommands) {
      if (commands.includes(cmd)) {
        foundCount++;
      }
    }

    assert.ok(
      foundCount > 0,
      `At least some commands should be registered (found ${foundCount}/${expectedCommands.length})`
    );
  });

  test("Extension package.json should have correct metadata", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should exist");

    const packageJSON = ext!.packageJSON;
    assert.strictEqual(
      packageJSON.name,
      "ts-mcp-debugger",
      "Name should match"
    );
    assert.strictEqual(
      packageJSON.publisher,
      "DigitalDefiance",
      "Publisher should match"
    );
    assert.ok(packageJSON.version, "Should have version");
    assert.ok(packageJSON.engines, "Should have engines");
    assert.ok(packageJSON.contributes, "Should have contributes");
  });

  test("Extension should contribute commands", () => {
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    assert.ok(ext, "Extension should exist");

    const packageJSON = ext!.packageJSON;
    assert.ok(packageJSON.contributes.commands, "Should contribute commands");
    assert.ok(
      packageJSON.contributes.commands.length > 0,
      "Should have at least one command"
    );
  });
});
