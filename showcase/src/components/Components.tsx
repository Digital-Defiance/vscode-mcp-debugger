import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Components.css";

interface Feature {
  title: string;
  description: string;
  icon: string;
  tech: string[];
  highlights: string[];
  category: "Core" | "Interfaces" | "Security" | "Errors" | "Builders";
}

const features: Feature[] = [
  {
    title: "Advanced Debugging",
    icon: "🐛",
    description:
      "Multi-language debugging support via Debug Adapter Protocol. Debug JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, Ruby, and more with AI-powered suggestions.",
    tech: ["Debug Adapter Protocol", "Chrome DevTools", "Multi-Language"],
    category: "Core",
    highlights: [
      "VS Code Extension: Multi-language support (Python, Java, Go, Rust, etc.)",
      "Standalone MCP Server: Node.js/JavaScript debugging",
      "Smart Breakpoints: AI-suggested locations based on code analysis",
      "Conditional Breakpoints: Break only when conditions are met",
      "Source Map Support: Debug TypeScript and transpiled languages",
    ],
  },
  {
    title: "Performance Profiling",
    icon: "📊",
    description:
      "Identify performance bottlenecks and memory leaks with comprehensive CPU and memory profiling. Track execution events and optimize your code.",
    tech: ["CPU Profiling", "Memory Analysis", "Performance"],
    category: "Core",
    highlights: [
      "CPU Profiling: Identify performance bottlenecks",
      "Memory Profiling: Take heap snapshots and detect leaks",
      "Performance Timeline: Track execution events and timing",
      "Real-time Performance Metrics: Monitor resource usage",
      "Export Profiles: Analyze with Chrome DevTools",
    ],
  },
  {
    title: "Hang Detection",
    icon: "🔍",
    description:
      "Automatically detect infinite loops and hanging processes. Get instant feedback when your code is stuck, with detailed location information.",
    tech: ["Hang Detection", "Loop Analysis", "Node.js"],
    category: "Core",
    highlights: [
      "Automatic infinite loop detection",
      "Configurable timeout thresholds",
      "Precise location reporting",
      "Stack trace capture at hang point",
      "Quick fixes via LSP code actions",
    ],
  },
  {
    title: "GitHub Copilot Integration",
    icon: "🤖",
    description:
      "Seamlessly integrate with GitHub Copilot for AI-assisted debugging. Let AI analyze errors, suggest fixes, and debug your code autonomously.",
    tech: ["GitHub Copilot", "AI Debugging", "MCP Protocol"],
    category: "Interfaces",
    highlights: [
      "AI-powered debugging recommendations",
      "Automatic error analysis and fixes",
      "Optimal breakpoint location suggestions",
      "Autonomous debugging workflows",
      "Natural language debugging commands",
    ],
  },
  {
    title: "Language Server Protocol (LSP)",
    icon: "🎨",
    description:
      "13 LSP features providing code intelligence, navigation, and real-time validation. Get hover information, signature help, and code actions.",
    tech: ["LSP", "Code Intelligence", "Real-time Validation"],
    category: "Interfaces",
    highlights: [
      "Code Actions: Convert console.log to breakpoints, add try-catch",
      "Signature Help: Real-time parameter hints for debugger functions",
      "Inlay Hints: Inline type annotations for return values",
      "Document Symbols: Outline view for debug sessions",
      "Diagnostics: Infinite loop detection, missing error handling",
    ],
  },
  {
    title: "Code Navigation & Hierarchy",
    icon: "🗺️",
    description:
      "Navigate debugger code with call hierarchy, type hierarchy, and document links. Understand function dependencies and type relationships.",
    tech: ["Navigation", "Call Hierarchy", "Type System"],
    category: "Interfaces",
    highlights: [
      "Call Hierarchy: Visualize debugger function dependencies",
      "Type Hierarchy: Explore debugger type relationships",
      "Document Links: Quick access to documentation",
      "Go to Definition: Navigate to function definitions",
      "Smart Selection: Expand selections intelligently",
    ],
  },
  {
    title: "Test Framework Support",
    icon: "🧪",
    description:
      "Debug tests with Jest, Mocha, Vitest, pytest, JUnit, and more. Set breakpoints in test files and step through test execution.",
    tech: ["Jest", "Mocha", "pytest", "JUnit"],
    category: "Core",
    highlights: [
      "Jest, Mocha, Vitest support (JS/TS)",
      "pytest debugging (Python)",
      "JUnit debugging (Java)",
      "go test, cargo test support",
      "Breakpoints in test files",
    ],
  },
  {
    title: "Code Editing Features",
    icon: "✏️",
    description:
      "Enhanced editing with folding ranges, linked editing, and color providers. Collapse debug blocks and edit related identifiers simultaneously.",
    tech: ["Folding", "Linked Editing", "Visual Indicators"],
    category: "Interfaces",
    highlights: [
      "Folding Ranges: Collapse/expand debug session blocks",
      "Selection Ranges: Smart selection expansion",
      "Linked Editing: Edit related identifiers simultaneously",
      "Color Provider: Visual severity indicators",
      "Semantic Tokens: Syntax highlighting for debugger code",
    ],
  },
];

const Components = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="components section" id="components" ref={ref}>
      <motion.div
        className="components-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          Core <span className="gradient-text">Features</span> & Capabilities
        </h2>
        <p className="components-subtitle">
          AI-powered debugging tools for modern multi-language development
        </p>

        <motion.div
          className="suite-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3>
            Debug <em>smarter</em>, not harder with <em>AI-powered</em> debugging
          </h3>
          <p>
            <strong>
              MCP ACS Debugger brings AI-assisted debugging to VS Code
            </strong>{" "}
            with support for JavaScript, TypeScript, Python, Java, C/C++, Go, Rust,
            PHP, Ruby, and more. Leveraging the Model Context Protocol, it seamlessly
            integrates with GitHub Copilot to provide{" "}
            <strong>intelligent debugging recommendations</strong> and autonomous
            debugging workflows.
          </p>
          <div className="problem-solution">
            <div className="problem">
              <h4>❌ The Challenge: Traditional Debugging Is Time-Consuming</h4>
              <ul>
                <li>Setting breakpoints at the right locations</li>
                <li>Identifying infinite loops and hanging processes</li>
                <li>Analyzing performance bottlenecks</li>
                <li>Understanding complex error scenarios</li>
                <li>Switching between debugging tools for different languages</li>
              </ul>
              <p>
                <strong>Result:</strong> You spend more time debugging than coding.
              </p>
            </div>
            <div className="solution">
              <h4>✅ The Solution: AI-Powered Multi-Language Debugging</h4>
              <p>
                <strong>MCP ACS Debugger</strong> provides{" "}
                <strong>smart breakpoint suggestions</strong> using code analysis,
                <strong> automatic hang detection</strong> for infinite loops,
                <strong> CPU and memory profiling</strong> to identify bottlenecks,
                and <strong>13 Language Server Protocol features</strong> for
                code intelligence.
              </p>
              <p>
                Built on the <strong>Debug Adapter Protocol</strong> and powered by
                <strong> Model Context Protocol</strong>, it works with any language
                that has a VS Code debugger. GitHub Copilot integration enables{" "}
                <strong>AI-assisted debugging</strong>, autonomous error analysis,
                and natural language debugging commands.
              </p>
            </div>
          </div>
          <div className="value-props">
            <div className="value-prop">
              <strong>🐛 Multi-Language Support</strong>
              <p>
                Debug JavaScript, Python, Java, C/C++, Go, Rust, PHP, Ruby, and more
                via Debug Adapter Protocol
              </p>
            </div>
            <div className="value-prop">
              <strong>🤖 AI Integration</strong>
              <p>
                GitHub Copilot integration for autonomous debugging, smart
                suggestions, and error analysis
              </p>
            </div>
            <div className="value-prop">
              <strong>📊 Performance Profiling</strong>
              <p>
                CPU profiling, memory snapshots, and performance timeline to
                optimize your code
              </p>
            </div>
            <div className="value-prop">
              <strong>🎨 13 LSP Features</strong>
              <p>
                Code actions, signature help, diagnostics, navigation, and more
                for enhanced development experience
              </p>
            </div>
          </div>
        </motion.div>

        <div className="components-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="component-card card"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className="component-header">
                <div className="component-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <span
                  className={`component-badge ${feature.category.toLowerCase()}`}
                >
                  {feature.category}
                </span>
              </div>

              <p className="component-description">{feature.description}</p>

              <ul className="component-highlights">
                {feature.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>

              <div className="component-tech">
                {feature.tech.map((tech) => (
                  <span key={tech} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Components;
