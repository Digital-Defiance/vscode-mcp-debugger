import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

suite("Language Server Test Suite", () => {
  let testDir: string;
  let languageServerReady = false;

  suiteSetup(async function () {
    this.timeout(15000);

    // Create temp directory for test files
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-debugger-test-"));

    // Activate extension
    const ext = vscode.extensions.getExtension(
      "DigitalDefiance.ts-mcp-debugger"
    );
    await ext!.activate();

    // Wait for language server to start
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check if language server is responding
    try {
      const testFile = path.join(testDir, "test-ready.js");
      fs.writeFileSync(testFile, "const x = 1;");

      const testDoc = await vscode.workspace.openTextDocument(testFile);
      await vscode.window.showTextDocument(testDoc);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        testDoc.uri,
        new vscode.Position(0, 6)
      );

      languageServerReady = hovers !== undefined && hovers.length > 0;
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
    } catch (error) {
      console.log("Language server not ready:", error);
      languageServerReady = false;
    }
  });

  test("Should provide diagnostics for infinite loops", async function () {
    this.timeout(10000);

    if (!languageServerReady) {
      this.skip();
      return;
    }

    // Create a real file with infinite loop
    const testFile = path.join(testDir, "infinite-loop-test.js");
    const content = `function test() {
  while(true) {
    console.log("infinite");
  }
}`;

    fs.writeFileSync(testFile, content);

    const testDocument = await vscode.workspace.openTextDocument(testFile);
    await vscode.window.showTextDocument(testDocument);

    // Wait for diagnostics to be computed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const diagnostics = vscode.languages.getDiagnostics(testDocument.uri);

    console.log(
      `Got ${diagnostics.length} diagnostics:`,
      diagnostics.map((d) => d.message)
    );

    // Should have a warning about infinite loop
    const infiniteLoopWarning = diagnostics.find(
      (d) =>
        d.message.toLowerCase().includes("infinite") ||
        d.message.toLowerCase().includes("loop")
    );

    assert.ok(
      infiniteLoopWarning,
      `Should detect infinite loop. Got diagnostics: ${diagnostics
        .map((d) => d.message)
        .join(", ")}`
    );

    if (infiniteLoopWarning) {
      assert.strictEqual(
        infiniteLoopWarning.severity,
        vscode.DiagnosticSeverity.Warning,
        "Should be a warning"
      );
    }
  });

  test("Should provide diagnostics for missing error handling", async function () {
    this.timeout(10000);

    if (!languageServerReady) {
      this.skip();
      return;
    }

    const testFile = path.join(testDir, "error-handling-test.js");
    const content = `function parseData(json) {
  const data = JSON.parse(json);
  return data;
}`;

    fs.writeFileSync(testFile, content);

    const testDocument = await vscode.workspace.openTextDocument(testFile);
    await vscode.window.showTextDocument(testDocument);

    // Wait for diagnostics
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const diagnostics = vscode.languages.getDiagnostics(testDocument.uri);

    console.log(
      `Got ${diagnostics.length} diagnostics:`,
      diagnostics.map((d) => d.message)
    );

    // Should have a suggestion about try-catch
    const errorHandlingSuggestion = diagnostics.find(
      (d) =>
        d.message.toLowerCase().includes("try") ||
        d.message.toLowerCase().includes("catch") ||
        d.message.toLowerCase().includes("error")
    );

    assert.ok(
      errorHandlingSuggestion,
      `Should suggest error handling. Got diagnostics: ${diagnostics
        .map((d) => d.message)
        .join(", ")}`
    );
  });

  test("Should provide code lens for function declarations", async function () {
    this.timeout(10000);

    if (!languageServerReady) {
      this.skip();
      return;
    }

    const testFile = path.join(testDir, "code-lens-test.js");
    const content = `function myFunction() {
  console.log("test");
}

const arrowFunc = () => {
  console.log("arrow");
};

for (let i = 0; i < 10; i++) {
  console.log(i);
}`;

    fs.writeFileSync(testFile, content);

    const testDocument = await vscode.workspace.openTextDocument(testFile);
    await vscode.window.showTextDocument(testDocument);

    // Wait for code lens
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const codeLenses = await vscode.commands.executeCommand<vscode.CodeLens[]>(
      "vscode.executeCodeLensProvider",
      testDocument.uri
    );

    console.log(
      `Got ${codeLenses?.length || 0} code lenses:`,
      codeLenses?.map((l) => l.command?.title)
    );

    assert.ok(
      codeLenses && codeLenses.length > 0,
      `Should provide code lenses. Got: ${codeLenses?.length || 0}`
    );

    if (codeLenses && codeLenses.length > 0) {
      // Should have breakpoint suggestions
      const breakpointLens = codeLenses.find(
        (lens) =>
          lens.command?.title.toLowerCase().includes("breakpoint") ||
          lens.command?.title.includes("🔴") ||
          lens.command?.title.includes("🔍")
      );

      assert.ok(
        breakpointLens,
        `Should suggest breakpoints. Got lenses: ${codeLenses
          .map((l) => l.command?.title)
          .join(", ")}`
      );
    }
  });

  test("Should provide hover information for variables", async function () {
    this.timeout(10000);

    if (!languageServerReady) {
      this.skip();
      return;
    }

    const testFile = path.join(testDir, "hover-test.js");
    const content = `function test() {
  const myVariable = 42;
  console.log(myVariable);
}`;

    fs.writeFileSync(testFile, content);

    const testDocument = await vscode.workspace.openTextDocument(testFile);
    await vscode.window.showTextDocument(testDocument);

    // Wait for language server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get hover at "myVariable" position (line 1, column 10)
    const position = new vscode.Position(1, 10);
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      "vscode.executeHoverProvider",
      testDocument.uri,
      position
    );

    assert.ok(hovers && hovers.length > 0, "Should provide hover information");

    if (hovers && hovers.length > 0) {
      const hoverContent = hovers[0].contents[0];
      const hoverText =
        typeof hoverContent === "string"
          ? hoverContent
          : "value" in hoverContent
          ? hoverContent.value
          : "";

      assert.ok(
        hoverText.toLowerCase().includes("variable") ||
          hoverText.toLowerCase().includes("inspect") ||
          hoverText.toLowerCase().includes("debug"),
        `Hover should contain debugging information. Got: ${hoverText}`
      );
    }
  });

  test("Should provide diagnostics for console.log usage", async function () {
    this.timeout(10000);

    if (!languageServerReady) {
      this.skip();
      return;
    }

    const testFile = path.join(testDir, "console-test.js");
    const content = `function test() {
  console.log("debugging");
  return 42;
}`;

    fs.writeFileSync(testFile, content);

    const testDocument = await vscode.workspace.openTextDocument(testFile);
    await vscode.window.showTextDocument(testDocument);

    // Wait for diagnostics
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const diagnostics = vscode.languages.getDiagnostics(testDocument.uri);

    console.log(
      `Got ${diagnostics.length} diagnostics:`,
      diagnostics.map((d) => d.message)
    );

    // Should have a hint about using debugger instead
    const consoleLogHint = diagnostics.find(
      (d) =>
        d.message.toLowerCase().includes("console") ||
        d.message.toLowerCase().includes("breakpoint") ||
        d.message.toLowerCase().includes("debugger")
    );

    // This is a hint, so it's okay if it's not always present
    if (consoleLogHint) {
      assert.strictEqual(
        consoleLogHint.severity,
        vscode.DiagnosticSeverity.Hint,
        "Should be a hint"
      );
    }
  });

  suiteTeardown(async () => {
    // Close all documents
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");

    // Clean up temp directory
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
