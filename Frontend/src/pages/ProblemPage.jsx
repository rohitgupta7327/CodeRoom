import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { BookOpenIcon, Code2Icon, TerminalIcon } from "lucide-react";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentProblemId = id && PROBLEMS[id] ? id : "two-sum";
  const currentProblem = PROBLEMS[currentProblemId];

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(() => currentProblem.starterCode.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // "description" | "editor" | "output"

  // update problem when URL param or selected language changes
  useEffect(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLanguage] || "");
      setOutput(null);
    }
  }, [currentProblemId, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };

  const normalizeOutput = (outputStr) => {
    if (!outputStr) return "";
    return outputStr
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/['"]/g, '"')
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    if (!actualOutput || !expectedOutput) return false;
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return (
      normalizedActual === normalizedExpected ||
      normalizedActual.toLowerCase() === normalizedExpected.toLowerCase()
    );
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // On mobile screens, switch to output tab so user sees result
    setActiveTab("output");

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);

      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Tests failed. Check your output!");
      }
    } else {
      toast.error("Code execution failed!");
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />

      {/* MOBILE TAB NAVIGATION (< md screens) */}
      <div className="md:hidden flex border-b border-base-300 bg-base-200 shrink-0">
        <button
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
            activeTab === "description"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => setActiveTab("description")}
        >
          <BookOpenIcon className="size-3.5" />
          Problem
        </button>
        <button
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
            activeTab === "editor"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => setActiveTab("editor")}
        >
          <Code2Icon className="size-3.5" />
          Code
        </button>
        <button
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
            activeTab === "output"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => setActiveTab("output")}
        >
          <TerminalIcon className="size-3.5" />
          Output
          {output && <span className="size-2 rounded-full bg-success animate-pulse ml-0.5" />}
        </button>
      </div>

      {/* MOBILE WORKSPACE VIEW (< md screens) */}
      <div className="flex-1 min-h-0 md:hidden overflow-auto">
        {activeTab === "description" && (
          <ProblemDescription
            problem={currentProblem}
            currentProblemId={currentProblemId}
            onProblemChange={handleProblemChange}
            allProblems={Object.values(PROBLEMS)}
          />
        )}
        {activeTab === "editor" && (
          <CodeEditorPanel
            selectedLanguage={selectedLanguage}
            code={code}
            isRunning={isRunning}
            onLanguageChange={handleLanguageChange}
            onCodeChange={setCode}
            onRunCode={handleRunCode}
          />
        )}
        {activeTab === "output" && <OutputPanel output={output} />}
      </div>

      {/* DESKTOP WORKSPACE PANELS (≥ md screens) */}
      <div className="hidden md:flex flex-col flex-1 min-h-0">
        <PanelGroup orientation="horizontal" direction="horizontal" key="problem-main-v5" id="problem-main-v5">
          {/* Left panel - Problem Description */}
          <Panel defaultSize={40} minSize={25}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-8 rounded-full bg-base-content/30" />
          </PanelResizeHandle>

          {/* Right panel - Code Editor (Top) & Output Panel (Bottom) */}
          <Panel defaultSize={60} minSize={30} className="h-full">
            <PanelGroup orientation="vertical" direction="vertical" key="problem-right-v5" id="problem-right-v5">
              {/* Top - Code Editor */}
              <Panel defaultSize={65} minSize={20}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              {/* Horizontal Resizable Handle between Code Editor and Output Panel */}
              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize flex items-center justify-center">
                <div className="w-8 h-1 rounded-full bg-base-content/30" />
              </PanelResizeHandle>

              {/* Bottom - Output Panel */}
              <Panel defaultSize={35} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;