import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaGithub,
  FaHeart,
  FaCode,
  FaUsers,
  FaRocket,
  FaLightbulb,
} from "react-icons/fa";
import "./About.css";

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="about section" id="about" ref={ref}>
      <motion.div
        className="about-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          Built with <span className="gradient-text">❤️</span> by Digital
          Defiance
        </h2>
        <p className="about-subtitle">
          Open source excellence in AI development tools
        </p>

        <div className="about-content">
          <motion.div
            className="about-main card"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="about-heading">
              <FaRocket /> Our Mission
            </h3>
            <p>
              At <strong>Digital Defiance</strong>, we believe in empowering
              developers with cutting-edge AI-powered tools that enhance
              productivity and code quality.
            </p>
            <p>
              <strong>MCP ACS Debugger</strong> embodies this mission by bringing
              AI-assisted debugging to VS Code. With multi-language support via
              Debug Adapter Protocol, seamless GitHub Copilot integration, and
              comprehensive Language Server Protocol features, we've created a
              debugging experience that works intelligently with you, not just
              for you.
            </p>
            <p className="highlight-text">
              <FaCode /> <strong>100% Open Source.</strong> This extension is
              freely available under the MIT License and is part of the AI
              Capabilities Suite ecosystem.
            </p>
          </motion.div>

          <div className="about-features">
            <motion.div
              className="feature-card card"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="feature-icon">
                <FaHeart />
              </div>
              <h4>Open Source First</h4>
              <p>
                MIT licensed and community-driven. Every line of code is open
                for inspection, improvement, and contribution.
              </p>
            </motion.div>

            <motion.div
              className="feature-card card"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="feature-icon">
                <FaCode />
              </div>
              <h4>Enterprise Quality</h4>
              <p>
                80+ comprehensive tests, E2E testing for all LSP features, and
                production-ready code. We don't compromise on quality.
              </p>
            </motion.div>

            <motion.div
              className="feature-card card"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h4>Community Driven</h4>
              <p>
                Built for developers, by developers. We listen to feedback and
                continuously improve based on real-world needs.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="about-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h3>Join the Community</h3>
          <p>
            Help us build the future of AI-powered development tools.
            Contribute to our projects, report issues, or star us on GitHub
            to show your support.
          </p>
          <div className="cta-buttons">
            <a
              href="https://digitaldefiance.org"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <FaLightbulb />
              Learn More
            </a>
            <a
              href="https://github.com/Digital-Defiance"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FaGithub />
              Visit Digital Defiance on GitHub
            </a>
            <a
              href="https://github.com/Digital-Defiance/ai-capabilities-suite"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <FaCode />
              Contribute to AI Capabilities Suite
            </a>
          </div>
        </motion.div>

        <div className="about-footer">
          <p>
            © {new Date().getFullYear()} Digital Defiance. Made with{" "}
            <span className="heart">❤️</span> for the development community.
          </p>
          <p className="footer-links">
            <a
              href="https://github.com/Digital-Defiance/vscode-mcp-debugger/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT License
            </a>
            {" • "}
            <a
              href="https://github.com/Digital-Defiance/vscode-mcp-debugger"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {" • "}
            <a
              href="https://marketplace.visualstudio.com/items?itemName=digital-defiance.mcp-acs-debugger"
              target="_blank"
              rel="noopener noreferrer"
            >
              VS Code Marketplace
            </a>
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
