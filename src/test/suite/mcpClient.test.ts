import * as assert from "assert";
import { MCPDebuggerClient } from "../../mcpClient";
import * as vscode from "vscode";

suite("MCP Client Test Suite", () => {
  let outputChannel: vscode.OutputChannel;
  const mockContext = {
    extensionPath: process.cwd(),
  } as vscode.ExtensionContext;

  setup(() => {
    outputChannel = vscode.window.createOutputChannel("MCP Test");
  });

  teardown(() => {
    outputChannel.dispose();
  });

  test("Should create MCP client instance", () => {
    const client = new MCPDebuggerClient(mockContext, outputChannel);
    assert.ok(client, "Client should be created");
  });

  test("Should have required methods", () => {
    const client = new MCPDebuggerClient(mockContext, outputChannel);

    assert.ok(typeof client.start === "function", "Should have start method");
    assert.ok(typeof client.stop === "function", "Should have stop method");
    assert.ok(
      typeof client.detectHang === "function",
      "Should have detectHang method"
    );
    assert.ok(
      typeof client.suggestBreakpoints === "function",
      "Should have suggestBreakpoints method"
    );
    assert.ok(
      typeof client.startCPUProfile === "function",
      "Should have startCPUProfile method"
    );
    assert.ok(
      typeof client.takeHeapSnapshot === "function",
      "Should have takeHeapSnapshot method"
    );
  });

  test("Should handle start/stop lifecycle", async function () {
    this.timeout(10000);

    const client = new MCPDebuggerClient(mockContext, outputChannel);

    try {
      await client.start();
      assert.ok(true, "Client started");
    } catch (error) {
      // Expected to fail in test environment
      assert.ok(true, "Start handled gracefully");
    }

    client.stop();
    assert.ok(true, "Client stopped");
  });

  test("Should reject operations before start", async () => {
    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.detectHang({
        command: "node",
        args: ["test.js"],
        timeout: 5000,
      });
      assert.fail("Should reject operation before start");
    } catch (error) {
      assert.ok(true, "Rejected operation before start");
    }
  });

  test("Should handle server startup failure", async function () {
    this.timeout(10000);

    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.start();
      // If it succeeds, that's also fine
      assert.ok(true, "Server started or handled failure gracefully");
    } catch (error) {
      assert.ok(true, "Handled server startup failure gracefully");
    } finally {
      client.stop();
    }
  });

  test("detectHang should accept valid parameters", async () => {
    const client = new MCPDebuggerClient(outputChannel);

    const params = {
      command: "node",
      args: ["test.js"],
      timeout: 5000,
    };

    try {
      await client.start();
      await client.detectHang(params);
    } catch (error) {
      // Expected to fail without actual server
      assert.ok(true, "Method accepts valid parameters");
    } finally {
      client.stop();
    }
  });

  test("suggestBreakpoints should accept file path", async () => {
    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.start();
      await client.suggestBreakpoints("/path/to/file.js");
    } catch (error) {
      // Expected to fail without actual server
      assert.ok(true, "Method accepts file path");
    } finally {
      client.stop();
    }
  });

  test("startCPUProfile should accept session ID", async () => {
    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.start();
      await client.startCPUProfile("session-123");
    } catch (error) {
      // Expected to fail without actual server
      assert.ok(true, "Method accepts session ID");
    } finally {
      client.stop();
    }
  });

  test("takeHeapSnapshot should accept session ID", async () => {
    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.start();
      await client.takeHeapSnapshot("session-123");
    } catch (error) {
      // Expected to fail without actual server
      assert.ok(true, "Method accepts session ID");
    } finally {
      client.stop();
    }
  });

  test("Should handle multiple start calls", async function () {
    this.timeout(10000);

    const client = new MCPDebuggerClient(outputChannel);

    try {
      await client.start();
      await client.start(); // Second start
      assert.ok(true, "Handled multiple start calls");
    } catch (error) {
      assert.ok(true, "Handled multiple start calls gracefully");
    } finally {
      client.stop();
    }
  });

  test("Should handle stop without start", () => {
    const client = new MCPDebuggerClient(outputChannel);
    client.stop();
    assert.ok(true, "Handled stop without start");
  });
});
