import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import { RefreshCwIcon, WifiOffIcon } from "lucide-react";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import JoinSessionModal from "../components/JoinSessionModal";

function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

    const createSessionMutation = useCreateSession();

    const {
        data: activeSessionsData,
        isLoading: loadingActiveSessions,
        isError: isErrorActive,
        refetch: refetchActive,
    } = useActiveSessions();
    const {
        data: recentSessionsData,
        isLoading: loadingRecentSessions,
        isError: isErrorRecent,
        refetch: refetchRecent,
    } = useMyRecentSessions();

    const handleRetry = () => {
        refetchActive();
        refetchRecent();
    };

    // Creating Rooms Method
    const handleCreateRoom = () => {
        if (!roomConfig.problem || !roomConfig.difficulty) return;

        createSessionMutation.mutate(
            {
                problem: roomConfig.problem,
                difficulty: roomConfig.difficulty.toLowerCase(),
            },
            {
                onSuccess: (data) => {
                    setShowCreateModal(false);
                    navigate(`/session/${data.session._id}`);
                },
            }
        );
    };

    const activeSessions = activeSessionsData?.sessions || [];
    const recentSessions = recentSessionsData?.sessions || [];

    const isUserInSession = (session) => {
        if (!user?.id) return false;

        return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
    };

    return (
        <>
            <div className="min-h-screen bg-base-300">
                <Navbar />
                <WelcomeSection
                    onCreateSession={() => setShowCreateModal(true)}
                    onJoinSession={() => setShowJoinModal(true)}
                />

                {/* Connection Error Banner */}
                {(isErrorActive || isErrorRecent) && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                        <div className="alert alert-error shadow-lg flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <WifiOffIcon className="size-6 text-error-content shrink-0" />
                                <div>
                                    <h3 className="font-bold text-sm sm:text-base">Backend Connection Failure</h3>
                                    <p className="text-xs opacity-90">Could not fetch session data from backend server. Check your internet connection.</p>
                                </div>
                            </div>
                            <button className="btn btn-sm btn-ghost border border-error-content/30 gap-1 shrink-0" onClick={handleRetry}>
                                <RefreshCwIcon className="size-4" /> Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <StatsCards
                            activeSessionsCount={activeSessions.length}
                            recentSessionsCount={recentSessions.length}
                        />
                        <ActiveSessions
                            sessions={activeSessions}
                            isLoading={loadingActiveSessions}
                            isUserInSession={isUserInSession}
                        />
                    </div>

                    <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
                </div>
            </div>

            <CreateSessionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                roomConfig={roomConfig}
                setRoomConfig={setRoomConfig}
                onCreateRoom={handleCreateRoom}
                isCreating={createSessionMutation.isPending}
            />

            <JoinSessionModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
            />
        </>
    );
}

export default DashboardPage;