import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const github = "https://github.com/Doppp/explorables";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function App() {
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="explorables home">
          explorables<span>.</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#how">How it works</a>
          <a href="#course">First course</a>
          <a href="#authors">For authors</a>
          <a href={github}>
            GitHub <Arrow />
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <p className="kicker">Open course format · local runtime · real code</p>
          <h1>
            See how it works.
            <br />
            <em>Build it yourself.</em>
          </h1>
          <p className="hero-copy">
            Interactive technical courses that live in a normal repository and run
            beside Codex or Claude Code Desktop—no account, backend, or black box
            required.
          </p>
          <div className="actions">
            <a
              className="button primary"
              href={`${github}/tree/master/examples/ai-from-first-principles`}
            >
              Explore the first course <span aria-hidden="true">→</span>
            </a>
            <a className="button secondary" href={github}>
              View on GitHub <Arrow />
            </a>
          </div>
          <fieldset
            className="course-window"
            aria-label="Course and coding workspace illustration"
          >
            <div className="workspace-pane">
              <div className="pane-label">
                <span>01</span> coding workspace
              </div>
              <p className="prompt">
                Before changing the learning rate, predict what happens at 1.2.
              </p>
              <div className="file-line active">exercises/gradient-descent/</div>
              <div className="file-line">starter/step.ts</div>
              <div className="terminal">
                <span>$</span> pnpm test
                <br />
                <b>2 passed</b> · explain why?
              </div>
            </div>
            <div className="preview-pane">
              <div className="pane-label">
                <span>02</span> browser preview
              </div>
              <p className="mini-heading">Gradient descent</p>
              <div className="chart" aria-hidden="true">
                <div className="curve" />
                <i className="point p1" />
                <i className="point p2" />
                <i className="point p3" />
              </div>
              <label>
                Learning rate <output>0.10</output>
                <input type="range" min="0" max="100" defaultValue="10" />
              </label>
            </div>
          </fieldset>
        </section>

        <section className="section" id="how">
          <div className="section-heading">
            <p className="kicker">A continuous learning loop</p>
            <h2>From intuition to implementation.</h2>
          </div>
          <ol className="steps">
            <li>
              <span>01</span>
              <h3>Predict</h3>
              <p>Commit to what you expect before the system reveals its behaviour.</p>
            </li>
            <li>
              <span>02</span>
              <h3>Manipulate</h3>
              <p>
                Change parameters and inspect the machinery in a sandboxed browser view.
              </p>
            </li>
            <li>
              <span>03</span>
              <h3>Implement</h3>
              <p>
                Move into focused starter code and make the concept work for yourself.
              </p>
            </li>
            <li>
              <span>04</span>
              <h3>Explain</h3>
              <p>
                Use your coding agent as a tutor: debug, verify, then explain the
                result.
              </p>
            </li>
          </ol>
        </section>

        <section className="section course-feature" id="course">
          <div>
            <p className="kicker">Course 001 · six-lesson MVP</p>
            <h2>
              AI from
              <br />
              First Principles
            </h2>
            <p className="feature-copy">
              For software developers who use modern AI tools and want to understand the
              machinery underneath them.
            </p>
            <a
              className="text-link"
              href={`${github}/tree/master/examples/ai-from-first-principles`}
            >
              Open the course <Arrow />
            </a>
          </div>
          <ol className="syllabus">
            {[
              ["01", "Gradient descent", "Loss, gradients, and step size"],
              ["02", "Backpropagation", "Forward values and local gradients"],
              ["03", "BPE tokenisation", "Pair counts and merge rules"],
              ["04", "Self-attention", "Queries, keys, masks, and weights"],
              ["05", "Sampling", "Temperature, top-k, and top-p"],
              ["06", "Evaluation leakage", "Splits, contamination, and trust"],
            ].map(([number, title, detail]) => (
              <li key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section author-section" id="authors">
          <div className="section-heading">
            <p className="kicker">Course as code</p>
            <h2>Author with tools you already know.</h2>
          </div>
          <div className="author-grid">
            <section className="code-card" aria-label="Example lesson source">
              <pre>
                <code>
                  <span>---</span>
                  {`\nid: gradient-descent\ntitle: Gradient Descent\n`}
                  <span>---</span>
                  {`\n\n# Gradient Descent\n\nPredict what happens next.\n\n`}
                  <b>:::explorable</b>
                  {`{src="../explorables/loss.ts"}\nChange the learning rate.\n`}
                  <b>:::</b>
                </code>
              </pre>
            </section>
            <div className="author-copy">
              <article>
                <span>MD</span>
                <h3>Plain Markdown</h3>
                <p>Lessons stay readable on GitHub and portable without the runtime.</p>
              </article>
              <article>
                <span>TS</span>
                <h3>TypeScript modules</h3>
                <p>
                  Build interactions with the DOM, Canvas, SVG, or a reviewed library.
                </p>
              </article>
              <article>
                <span>✓</span>
                <h3>Exercises and tests</h3>
                <p>
                  Teach through focused starter code, intentional failures, and
                  verification.
                </p>
              </article>
              <a
                className="button secondary"
                href={`${github}/blob/master/docs/course-authoring.md`}
              >
                Read the authoring guide <Arrow />
              </a>
            </div>
          </div>
        </section>

        <section className="closing">
          <p className="kicker">Open source · MIT licensed</p>
          <h2>The repository is the course.</h2>
          <p className="closing-copy">
            Fork it. Inspect it. Improve a lesson. Build a new explorable. Publish
            through the same workflows developers already use.
          </p>
          <div className="actions">
            <a className="button primary" href={github}>
              Get started on GitHub <Arrow />
            </a>
            <a className="text-link" href={`${github}/blob/master/CONTRIBUTING.md`}>
              Contribute
            </a>
          </div>
        </section>
      </main>

      <footer>
        <a className="wordmark" href="#top">
          explorables<span>.</span>
        </a>
        <div>
          <a href={github}>GitHub</a>
          <a href={`${github}/tree/master/docs`}>Documentation</a>
          <a href={`${github}/blob/master/LICENSE`}>MIT licence</a>
        </div>
        <p className="privacy">No analytics. No cookies. No learner tracking.</p>
      </footer>
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
