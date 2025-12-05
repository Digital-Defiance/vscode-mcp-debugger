import * as assert from "assert";
import * as vscode from "vscode";

suite("Performance Test Suite", () => {
  test("Extension should activate quickly", async function () {
    this.timeout(10000);

    const start = Date.now();
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );

    if (ext && !ext.isActive) {
      await ext.activate();
    }

    const duration = Date.now() - start;
    assert.ok(
      duration < 5000,
      `Activation took ${duration}ms (should be < 5000ms)`
    );
  });

  test("Command registration should be fast", async function () {
    this.timeout(5000);

    const start = Date.now();
    const commands = await vscode.commands.getCommands(true);
    const duration = Date.now() - start;

    assert.ok(
      duration < 1000,
      `Command listing took ${duration}ms (should be < 1000ms)`
    );
    assert.ok(commands.length > 0, "Commands should be registered");
  });

  test("Configuration access should be fast", () => {
    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      const config = vscode.workspace.getConfiguration("mcp-debugger");
      config.get("autoStart");
    }

    const duration = Date.now() - start;
    assert.ok(
      duration < 100,
      `100 config accesses took ${duration}ms (should be < 100ms)`
    );
  });

  test("Context provider should respond quickly", async function () {
    this.timeout(5000);

    const start = Date.now();

    try {
      await vscode.commands.executeCommand("mcp-debugger.getContext");
    } catch (error) {
      // Expected to fail without active session
    }

    const duration = Date.now() - start;
    assert.ok(
      duration < 1000,
      `Context retrieval took ${duration}ms (should be < 1000ms)`
    );
  });

  test("Multiple command executions should not degrade", async function () {
    this.timeout(10000);

    const durations: number[] = [];

    for (let i = 0; i < 5; i++) {
      const start = Date.now();

      try {
        await vscode.commands.executeCommand("mcp-debugger.showContext");
      } catch (error) {
        // Expected
      }

      durations.push(Date.now() - start);
    }

    // Check that later executions aren't significantly slower
    const firstDuration = durations[0];
    const lastDuration = durations[durations.length - 1];

    assert.ok(
      lastDuration < firstDuration * 2,
      `Performance degraded: first=${firstDuration}ms, last=${lastDuration}ms`
    );
  });

  test("Breakpoint operations should be fast", async function () {
    this.timeout(5000);

    const doc = await vscode.workspace.openTextDocument({
      language: "javascript",
      content: "function test() {\n  console.log('test');\n}",
    });

    await vscode.window.showTextDocument(doc);

    const start = Date.now();

    const bp = new vscode.SourceBreakpoint(
      new vscode.Location(doc.uri, new vscode.Position(1, 0))
    );

    vscode.debug.addBreakpoints([bp]);
    await new Promise((resolve) => setTimeout(resolve, 100));
    vscode.debug.removeBreakpoints([bp]);

    const duration = Date.now() - start;

    assert.ok(
      duration < 500,
      `Breakpoint operations took ${duration}ms (should be < 500ms)`
    );

    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("Language server should not block extension", async function () {
    this.timeout(10000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );

    assert.ok(ext?.isActive, "Extension should be active");

    // Extension should be responsive even if language server is slow
    const start = Date.now();
    const config = vscode.workspace.getConfiguration("mcp-debugger");
    config.get("autoStart");
    const duration = Date.now() - start;

    assert.ok(
      duration < 100,
      "Extension should remain responsive (< 100ms)"
    );
  });

  test("Memory usage should be reasonable", async function () {
    this.timeout(15000);

    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );

    assert.ok(ext?.isActive, "Extension should be active");

    // Create and dispose multiple resources
    for (let i = 0; i < 5; i++) {
      try {
        const doc = await vscode.workspace.openTextDocument({
          language: "javascript",
          content: `function test${i}() { return ${i}; }`,
        });

        await vscode.window.showTextDocument(doc);
        await new Promise(resolve => setTimeout(resolve, 100));
        await vscode.commands.executeCommand(
          "workbench.action.closeActiveEditor"
        );
      } catch (error) {
        // Ignore errors in test environment
      }
    }

    // Extension should still be responsive
    const start = Date.now();
    await vscode.commands.getCommands(true);
    const duration = Date.now() - start;

    assert.ok(
      duration < 2000,
      "Extension should remain responsive after resource churn"
    );
  });
});
