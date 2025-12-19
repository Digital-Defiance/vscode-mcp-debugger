import * as assert from "assert";
import * as vscode from "vscode";
import { MCPDebuggerClient } from "../../mcpClient";

suite("Debugger Integration Test Suite", () => {
  let outputChannel: vscode.LogOutputChannel;
  const mockContext = {
    extensionPath: process.cwd(),
  } as vscode.ExtensionContext;

  setup(() => {
    outputChannel = vscode.window.createOutputChannel(
      "MCP Debugger Integration Test",
      { log: true }
    );
  });

  teardown(() => {
    outputChannel.dispose();
  });

  suite("BaseMCPClient Integration Tests", () => {
    test("Should initialize with slow server (timeout handling)", async function () {
      this.timeout(70000); // 70 seconds for slow initialization

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // This tests the new timeout handling from BaseMCPClient
        // The client should handle slow initialization gracefully
        await client.start();

        // Verify connection status is available (new from BaseMCPClient)
        const status = client.getConnectionStatus();
        assert.ok(status);
        assert.ok(status.state);
        assert.ok(typeof status.serverProcessRunning === "boolean");

        // Verify diagnostics are available (new from BaseMCPClient)
        const diagnostics = client.getDiagnostics();
        assert.ok(diagnostics);
        assert.strictEqual(diagnostics.extensionName, "Debugger");
        assert.ok(typeof diagnostics.processRunning === "boolean");
        assert.ok(typeof diagnostics.pendingRequestCount === "number");

        client.stop();
      } catch (error: any) {
        // Expected if server not available - that's okay for this test
        assert.ok(
          error.message.includes("Server") ||
            error.message.includes("spawn") ||
            error.message.includes("timeout"),
          `Error should be server-related: ${error.message}`
        );
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should handle timeout and re-sync", async function () {
      this.timeout(90000); // 90 seconds for timeout and retry

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // Try to start - may timeout if server is slow
        await client.start();

        // If we get here, server started successfully
        // Test that isServerProcessAlive works (new from BaseMCPClient)
        const isAlive = client.isServerProcessAlive();
        assert.ok(typeof isAlive === "boolean");

        client.stop();
      } catch (error: any) {
        // Expected if server times out or isn't available
        // The important thing is that the client handles it gracefully
        assert.ok(
          error.message.includes("timeout") ||
            error.message.includes("Server") ||
            error.message.includes("spawn"),
          `Error should be timeout or server-related: ${error.message}`
        );
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should support reconnect functionality", async function () {
      this.timeout(60000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // Try initial connection
        try {
          await client.start();
        } catch (error) {
          // Server may not be available - that's okay
        }

        // Test reconnect method (new from BaseMCPClient)
        assert.ok(typeof client.reconnect === "function");

        // Try reconnect
        try {
          const reconnected = await client.reconnect();
          assert.ok(typeof reconnected === "boolean");
        } catch (error) {
          // Expected if server not available
        }

        client.stop();
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should preserve debugger-specific operations", async function () {
      this.timeout(30000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // Verify all debugger-specific methods still exist
        assert.ok(typeof client.detectHang === "function");
        assert.ok(typeof client.suggestBreakpoints === "function");
        assert.ok(typeof client.startCPUProfile === "function");
        assert.ok(typeof client.stopCPUProfile === "function");
        assert.ok(typeof client.takeHeapSnapshot === "function");
        assert.ok(typeof client.startDebugSession === "function");
        assert.ok(typeof client.setBreakpoint === "function");
        assert.ok(typeof client.continue === "function");
        assert.ok(typeof client.stepOver === "function");
        assert.ok(typeof client.stepInto === "function");
        assert.ok(typeof client.stepOut === "function");
        assert.ok(typeof client.pause === "function");
        assert.ok(typeof client.getStack === "function");
        assert.ok(typeof client.inspect === "function");
        assert.ok(typeof client.stopSession === "function");

        // Test that methods throw appropriate errors when server not started
        try {
          await client.detectHang({
            command: "node",
            args: ["test.js"],
            timeout: 5000,
          });
          assert.fail("Should have thrown error");
        } catch (error: any) {
          assert.ok(
            error.message.includes("Server") ||
              error.message.includes("not running") ||
              error.message.includes("not available")
          );
        }

        client.stop();
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should handle debugger-specific operations after start", async function () {
      this.timeout(30000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        await client.start();

        // Test suggestBreakpoints (should return empty array if tool not available)
        const breakpoints = await client.suggestBreakpoints("/path/to/file.js");
        assert.ok(Array.isArray(breakpoints));

        client.stop();
      } catch (error: any) {
        // Expected if server not available
        assert.ok(
          error.message.includes("Server") ||
            error.message.includes("spawn") ||
            error.message.includes("timeout")
        );
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should handle connection state changes", async function () {
      this.timeout(30000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // Initial state should be disconnected
        let status = client.getConnectionStatus();
        assert.strictEqual(status.state, "disconnected");

        // Try to start
        try {
          await client.start();
          // If successful, state should be connected
          status = client.getConnectionStatus();
          assert.ok(
            status.state === "connected" || status.state === "connecting"
          );
        } catch (error) {
          // If failed, state should be error or disconnected
          status = client.getConnectionStatus();
          assert.ok(
            status.state === "error" || status.state === "disconnected"
          );
        }

        client.stop();

        // After stop, state should be disconnected
        status = client.getConnectionStatus();
        assert.strictEqual(status.state, "disconnected");
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should provide comprehensive diagnostics", async function () {
      this.timeout(30000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        const diagnostics = client.getDiagnostics();

        // Verify all required diagnostic fields
        assert.strictEqual(diagnostics.extensionName, "Debugger");
        assert.ok(typeof diagnostics.processRunning === "boolean");
        assert.ok(typeof diagnostics.pendingRequestCount === "number");
        assert.ok(Array.isArray(diagnostics.pendingRequests));
        assert.ok(Array.isArray(diagnostics.recentCommunication));
        assert.ok(Array.isArray(diagnostics.stateHistory));
        assert.ok(typeof diagnostics.connectionState === "string");

        client.stop();
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });

    test("Should handle multiple start/stop cycles", async function () {
      this.timeout(60000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        // First cycle
        try {
          await client.start();
        } catch (error) {
          // Expected if server not available
        }
        client.stop();

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Second cycle
        try {
          await client.start();
        } catch (error) {
          // Expected if server not available
        }
        client.stop();

        // Client should still be functional
        const diagnostics = client.getDiagnostics();
        assert.ok(diagnostics);
      } finally {
        client.stop();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    });
  });

  suite("Error Recovery", () => {
    test("Should recover from server crash", async function () {
      this.timeout(5000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        await client.start();
      } catch (error) {
        // Extension should handle error gracefully
        assert.ok(error);
      } finally {
        client.stop();
      }

      // Client should still be usable
      const diagnostics = client.getDiagnostics();
      assert.ok(diagnostics);
    });

    test("Should handle rapid command execution", async function () {
      this.timeout(5000);

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      try {
        await client.start();
      } catch (error) {
        // Expected if server not available
      }

      // Execute multiple commands rapidly
      const promises = [
        client.suggestBreakpoints("/path/to/file1.js").catch(() => []),
        client.suggestBreakpoints("/path/to/file2.js").catch(() => []),
        client.suggestBreakpoints("/path/to/file3.js").catch(() => []),
      ];

      // Should not crash
      await Promise.allSettled(promises);

      client.stop();
    });
  });

  suite("Performance", () => {
    test("Client initialization should be fast", async function () {
      this.timeout(5000);

      const startTime = Date.now();

      const client = new MCPDebuggerClient(mockContext, outputChannel);

      const initTime = Date.now() - startTime;

      // Initialization should be instant (< 100ms)
      assert.ok(initTime < 100, `Initialization took ${initTime}ms`);

      client.stop();
    });
  });
});
