import { useState } from "react";
import {
    CalendarIcon,
    ClockIcon,
    Code2Icon,
    CrownIcon,
    TrophyIcon,
    UsersIcon,
    LoaderIcon,
    CheckCircle2Icon,
    EyeIcon,
} from "lucide-react";
import {
    formatSessionDate,
    formatSessionTime,
    getDifficultyBadgeClass,
} from "../lib/utils";
import SessionDetailsModal from "./SessionDetailsModal";

function RecentSessions({ sessions = [], isLoading = false }) {
    const [selectedSession, setSelectedSession] = useState(null);

    return (
        <>
            <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/30 w-full">
                <div className="card-body p-4 sm:p-6">
                    {/* HEADERS SECTION */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl text-primary-content">
                                <ClockIcon className="size-5" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black">Your Past Sessions</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium opacity-60">
                                {sessions.length} completed
                            </span>
                        </div>
                    </div>

                    {/* SESSIONS LIST */}
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <LoaderIcon className="size-10 animate-spin text-primary" />
                            </div>
                        ) : sessions.length > 0 ? (
                            sessions.map((session) => {
                                const createdDate = formatSessionDate(session.createdAt);
                                const startTime = formatSessionTime(session.createdAt);
                                const endTime = formatSessionTime(
                                    session.endedAt || session.updatedAt || session.lastActivity
                                );

                                return (
                                    <div
                                        key={session._id}
                                        className="card bg-base-200 border-2 border-base-300 hover:border-primary/40 transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5">
                                            {/* LEFT SIDE */}
                                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full min-w-0">
                                                <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 sm:mt-0">
                                                    <Code2Icon className="size-6 sm:size-7" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
                                                        <h3 className="font-bold text-base sm:text-lg truncate">{session.problem}</h3>
                                                        <span
                                                            className={`badge badge-sm ${getDifficultyBadgeClass(
                                                                session.difficulty
                                                            )}`}
                                                        >
                                                            {session.difficulty}
                                                        </span>
                                                        {session.status === "completed" ? (
                                                            <span className="badge badge-success badge-sm flex items-center gap-1">
                                                                <CheckCircle2Icon className="size-3" />
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="badge badge-warning badge-sm flex items-center gap-1">
                                                                <ClockIcon className="size-3" />
                                                                Incomplete
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* USERS AND TIMINGS SUMMARY */}
                                                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm opacity-80">
                                                        <div className="flex items-center gap-1.5">
                                                            <CrownIcon className="size-3.5 sm:size-4 text-primary" />
                                                            <span>Host: {session.host?.name || "User"}</span>
                                                        </div>
                                                        {session.participant && (
                                                            <div className="flex items-center gap-1.5">
                                                                <UsersIcon className="size-3.5 sm:size-4 text-secondary" />
                                                                <span>Participant: {session.participant.name}</span>
                                                            </div>
                                                        )}

                                                        {/* CREATED DATE & START/END TIMINGS */}
                                                        <div className="flex items-center gap-1.5 text-base-content/70">
                                                            <CalendarIcon className="size-3.5 text-primary" />
                                                            <span>{createdDate}</span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 text-base-content/70">
                                                            <ClockIcon className="size-3.5 text-accent" />
                                                            <span>
                                                                {startTime} - {endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE ACTION */}
                                            <div className="w-full sm:w-auto flex justify-end shrink-0">
                                                <button
                                                    onClick={() => setSelectedSession(session)}
                                                    className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 gap-1.5 w-full sm:w-auto justify-center"
                                                >
                                                    <EyeIcon className="size-4" />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <TrophyIcon className="w-8 h-8" />
                                </div>
                                <p className="text-lg font-bold opacity-80 mb-1">No sessions yet</p>
                                <p className="text-sm opacity-50">Start your coding journey today!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            <SessionDetailsModal
                session={selectedSession}
                isOpen={!!selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        </>
    );
}

export default RecentSessions;