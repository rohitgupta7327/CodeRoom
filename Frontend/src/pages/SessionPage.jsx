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
import {
  formatSessionDate,
  formatSessionDuration,
  formatSessionTime,
  getDifficultyBadgeClass,
} from "../lib/utils";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  Code2Icon,
  CopyIcon,
  CrownIcon,
  LoaderIcon,
  LockIcon,
  LogOutIcon,
  TerminalIcon,
  TimerIcon,
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
    const createdDate = formatSessionDate(session.createdAt);
    const startTime = formatSessionTime(session.createdAt);
    const endTime = formatSessionTime(
      session.endedAt || session.updatedAt || session.lastActivity
    );
    const duration = formatSessionDuration(
      session.createdAt,
      session.endedAt || session.updatedAt || session.lastActivity
    );

    return (
      <div className="min-h-screen bg-base-300 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
          <div className="card bg-base-100 border-2 border-primary/20 shadow-xl overflow-hidden">
            {/* CARD HEADER */}
            <div className="bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 p-6 sm:p-8 border-b border-base-300">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content"
                >
                  <ArrowLeftIcon className="size-4" />
                  Back to Dashboard
                </button>

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <span className="badge badge-success gap-1 px-3 py-2 font-semibold">
                      <CheckCircle2Icon className="size-3.5" />
                      Session Completed
                    </span>
                  ) : (
                    <span className="badge badge-warning gap-1 px-3 py-2 font-semibold">
                      <ClockIcon className="size-3.5" />
                      Session Incomplete
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center shrink-0">
                  <Code2Icon className="size-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black">{session.problem}</h1>
                    <span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>
                      {session.difficulty}
                    </span>
                  </div>
                  <p className="text-sm opacity-70 mt-1">
                    {isCompleted
                      ? "This session was completed and ended."
                      : "This session ended automatically due to inactivity."}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD BODY METRICS */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                Session Timings & Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CREATED DATE */}
                <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                    <CalendarIcon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block">
                      Created Date
                    </span>
                    <span className="text-base font-bold text-base-content truncate block">
                      {createdDate}
                    </span>
                  </div>
                </div>

                {/* START TIME */}
                <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-xl text-secondary shrink-0">
                    <ClockIcon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block">
                      Start Time
                    </span>
                    <span className="text-base font-bold text-base-content truncate block">
                      {startTime}
                    </span>
                  </div>
                </div>

                {/* SESSION END TIMING */}
                <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent shrink-0">
                    <CheckCircle2Icon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block">
                      End Timing
                    </span>
                    <span className="text-base font-bold text-base-content truncate block">
                      {endTime}
                    </span>
                  </div>
                </div>

                {/* DURATION */}
                <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-xl text-warning shrink-0">
                    <TimerIcon className="size-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block">
                      Total Duration
                    </span>
                    <span className="text-base font-bold text-base-content truncate block">
                      {duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* PARTICIPANTS */}
              <div className="pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/60 mb-3">
                  Participants
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* HOST */}
                  <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-4">
                    {session.host?.profileImage ? (
                      <img
                        src={session.host.profileImage}
                        alt={session.host.name}
                        className="size-12 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        <CrownIcon className="size-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-primary uppercase">Host</span>
                      <p className="font-bold text-base truncate">{session.host?.name || "Session Host"}</p>
                      {session.host?.email && (
                        <p className="text-xs opacity-60 truncate">{session.host.email}</p>
                      )}
                    </div>
                  </div>

                  {/* PARTICIPANT */}
                  <div className="bg-base-200 border border-base-300 p-4 rounded-2xl flex items-center gap-4">
                    {session.participant?.profileImage ? (
                      <img
                        src={session.participant.profileImage}
                        alt={session.participant.name}
                        className="size-12 rounded-full object-cover border-2 border-secondary"
                      />
                    ) : session.participant ? (
                      <div className="size-12 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                        <UsersIcon className="size-6" />
                      </div>
                    ) : (
                      <div className="size-12 rounded-full bg-base-300 text-base-content/40 flex items-center justify-center">
                        <UsersIcon className="size-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-secondary uppercase">Participant</span>
                      {session.participant ? (
                        <>
                          <p className="font-bold text-base truncate">{session.participant.name}</p>
                          {session.participant.email && (
                            <p className="text-xs opacity-60 truncate">{session.participant.email}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm opacity-50 italic">No participant joined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 flex justify-end">
                <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
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
