import * as assert from "assert";
import * as vscode from "vscode";
import { MCPDebugAdapterDescriptorFactory } from "../../debugAdapterFactory";

suite("Debug Adapter Factory Test Suite", () => {
  let factory: MCPDebugAdapterDescriptorFactory;

  setup(() => {
    factory = new MCPDebugAdapterDescriptorFactory();
  });

  teardown(() => {
    factory.dispose();
  });

  test("Should create factory instance", () => {
    assert.ok(factory, "Factory should be created");
  });

  test("Should have createDebugAdapterDescriptor method", () => {
    assert.ok(
      typeof factory.createDebugAdapterDescriptor === "function",
      "Should have createDebugAdapterDescriptor method"
    );
  });

  test("Should have dispose method", () => {
    assert.ok(
      typeof factory.dispose === "function",
      "Should have dispose method"
    );
  });

  test("Should create inline debug adapter descriptor", () => {
    const mockSession: vscode.DebugSession = {
      id: "test-session",
      type: "mcp-node",
      name: "Test Session",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Test",
        program: "/test/file.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const descriptor = factory.createDebugAdapterDescriptor(
      mockSession,
      undefined
    );

    assert.ok(descriptor, "Should create descriptor");
    assert.ok(
      descriptor instanceof vscode.DebugAdapterInlineImplementation,
      "Should be inline implementation"
    );
  });

  test("Should create descriptor for launch request", () => {
    const mockSession: vscode.DebugSession = {
      id: "launch-session",
      type: "mcp-node",
      name: "Launch Session",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Launch Test",
        program: "/test/file.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const descriptor = factory.createDebugAdapterDescriptor(
      mockSession,
      undefined
    );

    assert.ok(descriptor, "Should create descriptor for launch");
  });

  test("Should create descriptor for attach request", () => {
    const mockSession: vscode.DebugSession = {
      id: "attach-session",
      type: "mcp-node",
      name: "Attach Session",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "attach",
        name: "Attach Test",
        sessionId: "existing-session",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const descriptor = factory.createDebugAdapterDescriptor(
      mockSession,
      undefined
    );

    assert.ok(descriptor, "Should create descriptor for attach");
  });

  test("Should handle multiple descriptor creations", () => {
    const mockSession1: vscode.DebugSession = {
      id: "session-1",
      type: "mcp-node",
      name: "Session 1",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Test 1",
        program: "/test/file1.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const mockSession2: vscode.DebugSession = {
      id: "session-2",
      type: "mcp-node",
      name: "Session 2",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Test 2",
        program: "/test/file2.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const descriptor1 = factory.createDebugAdapterDescriptor(
      mockSession1,
      undefined
    );
    const descriptor2 = factory.createDebugAdapterDescriptor(
      mockSession2,
      undefined
    );

    assert.ok(descriptor1, "Should create first descriptor");
    assert.ok(descriptor2, "Should create second descriptor");
    assert.notStrictEqual(
      descriptor1,
      descriptor2,
      "Should create separate descriptors"
    );
  });

  test("Should dispose without errors", () => {
    assert.doesNotThrow(() => {
      factory.dispose();
    }, "Dispose should not throw");
  });

  test("Should handle dispose multiple times", () => {
    assert.doesNotThrow(() => {
      factory.dispose();
      factory.dispose();
    }, "Multiple dispose calls should not throw");
  });

  test("Should work with workspace folder", () => {
    const mockWorkspaceFolder: vscode.WorkspaceFolder = {
      uri: vscode.Uri.file("/test/workspace"),
      name: "Test Workspace",
      index: 0,
    };

    const mockSession: vscode.DebugSession = {
      id: "workspace-session",
      type: "mcp-node",
      name: "Workspace Session",
      workspaceFolder: mockWorkspaceFolder,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Workspace Test",
        program: "/test/file.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const descriptor = factory.createDebugAdapterDescriptor(
      mockSession,
      undefined
    );

    assert.ok(descriptor, "Should create descriptor with workspace folder");
  });

  test("Should ignore executable parameter", () => {
    const mockSession: vscode.DebugSession = {
      id: "test-session",
      type: "mcp-node",
      name: "Test Session",
      workspaceFolder: undefined,
      configuration: {
        type: "mcp-node",
        request: "launch",
        name: "Test",
        program: "/test/file.js",
      },
      customRequest: async () => ({}),
      getDebugProtocolBreakpoint: async () => undefined,
    };

    const mockExecutable = new vscode.DebugAdapterExecutable(
      "node",
      ["/path/to/adapter.js"],
      {}
    );

    const descriptor = factory.createDebugAdapterDescriptor(
      mockSession,
      mockExecutable
    );

    assert.ok(descriptor, "Should create descriptor");
    assert.ok(
      descriptor instanceof vscode.DebugAdapterInlineImplementation,
      "Should still use inline implementation"
    );
  });
});
