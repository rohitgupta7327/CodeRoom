// Code Execution Service (Wandbox API + Fallback)

const WANDBOX_API = "https://wandbox.org/api/compile.json";

const WANDBOX_COMPILERS = {
  javascript: "nodejs-20.17.0",
  python: "cpython-3.12.7",
  java: "openjdk-jdk-21+35",
  c: "gcc-head-c",
  cpp: "gcc-head",
};

/**
 * Executes code using Wandbox API with fallback for JavaScript
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success: boolean, output?: string, error?: string}>}
 */
export async function executeCode(language, code) {
  const normalizedLang = (language || "").toLowerCase();
  const compiler = WANDBOX_COMPILERS[normalizedLang];

  if (!compiler) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  // Pre-process code for language-specific requirements
  let codeToRun = code;
  if (normalizedLang === "java") {
    // Wandbox expects non-public class when file is named prog.java
    codeToRun = code.replace(/public\s+class\s+/, "class ");
  }

  try {
    const response = await fetch(WANDBOX_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        compiler: compiler,
        code: codeToRun,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const output = (data.program_output || "").trim();
    const stderr = (data.program_error || data.compiler_error || "").trim();
    const exitCode = data.status;

    if (exitCode !== "0" && exitCode !== 0) {
      return {
        success: false,
        output: output,
        error: stderr || output || "Execution error",
      };
    }

    if (stderr && !output) {
      return {
        success: false,
        output: output,
        error: stderr,
      };
    }

    return {
      success: true,
      output: output || "No output",
    };
  } catch (error) {
    // Local fallback for JavaScript execution if network/API fails
    if (normalizedLang === "javascript") {
      return executeJavaScriptLocally(code);
    }

    return {
      success: false,
      error: `Code execution failed: ${error.message}`,
    };
  }
}

/**
 * Safely execute JavaScript code in the browser as fallback
 * @param {string} code
 */
function executeJavaScriptLocally(code) {
  try {
    const logs = [];
    const customConsole = {
      log: (...args) => {
        logs.push(
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ")
        );
      },
      error: (...args) => {
        logs.push(
          "[Error] " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ")
        );
      },
      warn: (...args) => {
        logs.push(
          "[Warn] " +
            args
              .map((arg) =>
                typeof arg === "object" ? JSON.stringify(arg) : String(arg)
              )
              .join(" ")
        );
      },
    };

    const runFunc = new Function("console", code);
    runFunc(customConsole);

    return {
      success: true,
      output: logs.join("\n") || "No output",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}