import {
    ClockIcon,
    Code2Icon,
    CrownIcon,
    TrophyIcon,
    UsersIcon,
    LoaderIcon,
    CheckCircle2Icon,
} from "lucide-react";
import { Link } from "react-router";
import { getDifficultyBadgeClass } from "../lib/utils";

function RecentSessions({ sessions = [], isLoading = false }) {
    return (
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
                        sessions.map((session) => (
                            <div
                                key={session._id}
                                className="card bg-base-200 border-2 border-base-300 hover:border-primary/40 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5">
                                    {/* LEFT SIDE */}
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full min-w-0">
                                        <div className="size-12 sm:size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
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

                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm opacity-80">
                                                <div className="flex items-center gap-1.5">
                                                    <CrownIcon className="size-3.5 sm:size-4" />
                                                    <span>Host: {session.host?.name || "User"}</span>
                                                </div>
                                                {session.participant && (
                                                    <div className="flex items-center gap-1.5">
                                                        <UsersIcon className="size-3.5 sm:size-4" />
                                                        <span>Participant: {session.participant.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-auto flex justify-end shrink-0">
                                        <Link
                                            to={`/session/${session._id}`}
                                            className="btn btn-ghost btn-sm text-primary w-full sm:w-auto justify-center"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
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
    );
}

export default RecentSessions;