import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";

import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import VideoCallPanel from "../components/VideoCallPanel";
import { executeCode } from "../lib/piston";
import { useEndSession, useJoinSession, useLeaveSession, useSessionById } from "../hooks/useSessions";
import { getDifficultyBadgeClass } from "../lib/utils";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  BookOpenIcon,
  Code2Icon,
  CopyIcon,
  LoaderIcon,
  LockIcon,
  LogOutIcon,
  TerminalIcon,
  UserPlusIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";

function SessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();

  const { data, isLoading, error } = useSessionById(id);
  const endSessionMutation = useEndSession();
  const joinSessionMutation = useJoinSession();
  const leaveSessionMutation = useLeaveSession();

  const session = data?.session;

  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // "description" | "editor" | "output" | "video"

  // Find problem from PROBLEMS dataset based on session problem title or fallback to two-sum
  const problemEntry = Object.entries(PROBLEMS).find(
    ([_, p]) => p.title.toLowerCase() === (session?.problem || "").toLowerCase()
  );
  const sessionProblemId = problemEntry ? problemEntry[0] : "two-sum";
  const currentProblemId = selectedProblemId || sessionProblemId;
  const currentProblem = PROBLEMS[currentProblemId] || PROBLEMS["two-sum"];

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(currentProblem.starterCode.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Update starter code when problem or selected language changes
  useEffect(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLanguage] || "");
      setOutput(null);
    }
  }, [currentProblemId, selectedLanguage]);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleProblemChange = (newProblemId) => {
    if (PROBLEMS[newProblemId]) {
      setSelectedProblemId(newProblemId);
    }
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
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

    // On mobile screens, automatically open output tab so user sees result
    setActiveTab("output");

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput?.[selectedLanguage];
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

  const handleJoinSession = async () => {
    try {
      await joinSessionMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    try {
      await endSessionMutation.mutateAsync(id);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await leaveSessionMutation.mutateAsync(id);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Session invite link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <LoaderIcon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
        <p className="text-base-content/70 mb-4">The session you are looking for does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = session.status === "completed";
  const isIncomplete = session.status === "incomplete";

  if (isCompleted || isIncomplete) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-bold mb-3">
          {isCompleted ? "Session Completed" : isIncomplete ? "Session Incomplete" : "Session Not Found"}
        </h2>
        <p className="text-base-content/70 mb-6 max-w-md">
          {isCompleted
            ? "This session was successfully completed and ended by the session creator."
            : isIncomplete
              ? "This session was not ended by the session creator and was automatically marked as incomplete after 30 minutes of inactivity."
              : "The requested session does not exist."}
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isHost = session.host?.clerkId === currentUser?.id;
  const isParticipant = session.participant?.clerkId === currentUser?.id;
  const isUserInSession = isHost || isParticipant;
  const isSessionFull = session.host && session.participant && !isUserInSession;

  if (isSessionFull) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
          <LockIcon className="size-8" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Session Full (2/2 Members)</h2>
        <p className="text-base-content/70 mb-6 max-w-md">
          This 1-on-1 interview session is full with 2 members ({session.host?.name || "Host"} &{" "}
          {session.participant?.name || "Participant"}).
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Helper to render video call or join prompt
  const renderVideoCallArea = () => {
    if (isUserInSession) {
      return (
        <VideoCallPanel
          session={session}
          onLeaveCall={isHost ? handleEndSession : isParticipant ? handleLeaveSession : undefined}
        />
      );
    }

    return (
      <div className="h-full bg-base-300 flex flex-col items-center justify-center p-6 text-center">
        <UsersIcon className="size-10 text-primary mb-3" />
        <h3 className="text-lg font-bold mb-1">Join Session to Enter Video Call</h3>
        <p className="text-xs text-base-content/70 max-w-xs mb-4">
          Click "Join Session" to participate in this 1-on-1 coding interview.
        </p>
        <button
          className="btn btn-accent btn-sm gap-2"
          onClick={handleJoinSession}
          disabled={joinSessionMutation.isPending}
        >
          <UserPlusIcon className="size-4" /> Join Session
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />

      {/* SESSION HEADER INFO BAR */}
      <div className="bg-base-200 border-b border-base-300 px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-bold text-sm sm:text-lg">{session.problem}</span>
          <span className={`badge badge-xs sm:badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>
            {session.difficulty}
          </span>
          <span
            className={`badge badge-xs sm:badge-sm ${session.status === "active" ? "badge-success" : "badge-warning"}`}
          >
            {session.status}
          </span>
        </div>

        {/* PARTICIPANT & HOST INFO */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base-content/60">Host:</span>
            <span className="font-semibold">{session.host?.name || "Host"}</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base-content/60">Participant:</span>
            {session.participant ? (
              <span className="font-semibold">{session.participant.name}</span>
            ) : (
              <span className="text-base-content/40 italic">Waiting for participant...</span>
            )}
          </div>

          {/* ACTION BUTTONS */}
          {session.status === "active" && (
            <button
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-content/20 gap-1"
              onClick={handleCopyLink}
              title="Copy session invite link"
            >
              <CopyIcon className="size-3 sm:size-4 text-primary" />
              <span className="hidden xs:inline">Copy Link</span>
            </button>
          )}

          {!isUserInSession && session.status === "active" && !session.participant && (
            <button
              className="btn btn-xs sm:btn-sm btn-accent gap-1"
              onClick={handleJoinSession}
              disabled={joinSessionMutation.isPending}
            >
              <UserPlusIcon className="size-3 sm:size-4" />
              Join Session
            </button>
          )}
        </div>
      </div>

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
        <button
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
            activeTab === "video"
              ? "bg-base-100 text-primary border-b-2 border-primary"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => setActiveTab("video")}
        >
          <VideoIcon className="size-3.5" />
          Video Call
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
        {activeTab === "video" && renderVideoCallArea()}
      </div>

      {/* DESKTOP SPLIT-SCREEN WORKSPACE PANELS (≥ md screens) */}
      <div className="hidden md:flex flex-col flex-1 min-h-0">
        <PanelGroup orientation="horizontal" direction="horizontal">
          {/* LEFT HALF: Coding Workspace (Problem + Editor + Output) */}
          <Panel defaultSize={65} minSize={40}>
            <PanelGroup orientation="horizontal" direction="horizontal">
              {/* Problem Description */}
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

              {/* Code Editor & Output Panel */}
              <Panel defaultSize={60} minSize={30} className="h-full">
                <PanelGroup orientation="vertical" direction="vertical">
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
          </Panel>

          {/* MAIN RESIZE HANDLE BETWEEN CODING WORKSPACE AND VIDEO CALL */}
          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-1 h-12 rounded-full bg-base-content/40" />
          </PanelResizeHandle>

          {/* RIGHT HALF: Real-Time Stream Video Call Panel */}
          <Panel defaultSize={35} minSize={25}>
            {renderVideoCallArea()}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
