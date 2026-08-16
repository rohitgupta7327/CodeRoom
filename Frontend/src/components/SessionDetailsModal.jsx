import {
    CalendarIcon,
    ClockIcon,
    Code2Icon,
    CrownIcon,
    TimerIcon,
    UsersIcon,
    XIcon,
    CheckCircle2Icon,
    AlertCircleIcon,
    ExternalLinkIcon,
} from "lucide-react";
import { Link } from "react-router";
import {
    formatSessionDate,
    formatSessionDuration,
    formatSessionTime,
    getDifficultyBadgeClass,
} from "../lib/utils";

function SessionDetailsModal({ session, isOpen, onClose }) {
    if (!isOpen || !session) return null;

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
        <div className="modal modal-open flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50">
            <div className="modal-box max-w-2xl w-full bg-base-100 border border-primary/20 shadow-2xl p-6 sm:p-8 rounded-2xl relative animate-in fade-in zoom-in-95 duration-200">
                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60 hover:text-base-content"
                    aria-label="Close modal"
                >
                    <XIcon className="size-5" />
                </button>

                {/* MODAL HEADER */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                        <Code2Icon className="size-7" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-xl sm:text-2xl font-black text-base-content truncate">
                                {session.problem}
                            </h3>
                            <span
                                className={`badge badge-sm font-semibold ${getDifficultyBadgeClass(
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
                            ) : session.status === "active" ? (
                                <span className="badge badge-info badge-sm flex items-center gap-1 animate-pulse">
                                    Active
                                </span>
                            ) : (
                                <span className="badge badge-warning badge-sm flex items-center gap-1">
                                    <AlertCircleIcon className="size-3" />
                                    Incomplete
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-base-content/60">
                            Detailed overview and metadata of this coding session.
                        </p>
                    </div>
                </div>

                {/* TIMINGS & DATE GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {/* CREATED DATE */}
                    <div className="bg-base-200 border border-base-300 p-3.5 rounded-xl flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                            <CalendarIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider block">
                                Created Date
                            </span>
                            <span className="text-sm font-bold text-base-content truncate block">
                                {createdDate}
                            </span>
                        </div>
                    </div>

                    {/* START TIME */}
                    <div className="bg-base-200 border border-base-300 p-3.5 rounded-xl flex items-center gap-3">
                        <div className="p-2.5 bg-secondary/10 rounded-lg text-secondary shrink-0">
                            <ClockIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider block">
                                Start Time
                            </span>
                            <span className="text-sm font-bold text-base-content truncate block">
                                {startTime}
                            </span>
                        </div>
                    </div>

                    {/* END TIMING */}
                    <div className="bg-base-200 border border-base-300 p-3.5 rounded-xl flex items-center gap-3">
                        <div className="p-2.5 bg-accent/10 rounded-lg text-accent shrink-0">
                            <CheckCircle2Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider block">
                                End Timing
                            </span>
                            <span className="text-sm font-bold text-base-content truncate block">
                                {endTime}
                            </span>
                        </div>
                    </div>

                    {/* DURATION */}
                    <div className="bg-base-200 border border-base-300 p-3.5 rounded-xl flex items-center gap-3">
                        <div className="p-2.5 bg-warning/10 rounded-lg text-warning shrink-0">
                            <TimerIcon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider block">
                                Duration
                            </span>
                            <span className="text-sm font-bold text-base-content truncate block">
                                {duration}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PARTICIPANTS SECTION */}
                <div className="space-y-3 mb-8">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/70">
                        Session Participants
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* HOST */}
                        <div className="bg-base-200 border border-base-300 p-4 rounded-xl flex items-center gap-3">
                            {session.host?.profileImage ? (
                                <img
                                    src={session.host.profileImage}
                                    alt={session.host.name}
                                    className="size-11 rounded-full object-cover border border-primary/30"
                                />
                            ) : (
                                <div className="size-11 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    <CrownIcon className="size-5" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-primary uppercase">Host</span>
                                </div>
                                <p className="font-bold text-sm text-base-content truncate">
                                    {session.host?.name || "Session Host"}
                                </p>
                                {session.host?.email && (
                                    <p className="text-xs text-base-content/60 truncate">
                                        {session.host.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* PARTICIPANT */}
                        <div className="bg-base-200 border border-base-300 p-4 rounded-xl flex items-center gap-3">
                            {session.participant?.profileImage ? (
                                <img
                                    src={session.participant.profileImage}
                                    alt={session.participant.name}
                                    className="size-11 rounded-full object-cover border border-secondary/30"
                                />
                            ) : session.participant ? (
                                <div className="size-11 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                                    <UsersIcon className="size-5" />
                                </div>
                            ) : (
                                <div className="size-11 rounded-full bg-base-300 flex items-center justify-center text-base-content/40">
                                    <UsersIcon className="size-5" />
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <span className="text-xs font-semibold text-secondary uppercase">
                                    Participant
                                </span>
                                {session.participant ? (
                                    <>
                                        <p className="font-bold text-sm text-base-content truncate">
                                            {session.participant.name}
                                        </p>
                                        {session.participant.email && (
                                            <p className="text-xs text-base-content/60 truncate">
                                                {session.participant.email}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-base-content/50 italic">
                                        No participant joined
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODAL FOOTER ACTIONS */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-base-300">
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm w-full sm:w-auto"
                    >
                        Close
                    </button>
                    <Link
                        to={`/session/${session._id}`}
                        onClick={onClose}
                        className="btn btn-primary btn-sm gap-2 w-full sm:w-auto justify-center"
                    >
                        <ExternalLinkIcon className="size-4" />
                        View Full Details Page
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SessionDetailsModal;
